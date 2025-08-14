import random
from decimal import Decimal

from apps.categories.models import Attribute, AttributeValue, Category
from apps.common.models import TimeStampedModel
from apps.vendor.models import Vendor
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _


class Product(TimeStampedModel):
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="products"
    )

    sku = models.CharField(max_length=100, unique=True, blank=True)
    tool = models.CharField(max_length=100, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    attributes = models.JSONField()
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = (
                f"{self.category.name[:3].upper()}-GEN-{random.randint(1000, 9999)}"
            )
        super().save(*args, **kwargs)

    def generate_sku(self):
        base = self.category.name[:3].upper()
        attrs = (
            "-".join([av.attribute_value[:3].upper() for av in self.attributes.all()])
            or "GEN"
        )
        rand = str(random.randint(1000, 9999))
        return f"{base}-{attrs}-{rand}"

    def __str__(self):
        return f"{self.sku} - {self.category.name}"

    class Meta:
        ordering = ["sku"]


class Warehouse(TimeStampedModel):
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="warehouse"
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Stock(TimeStampedModel):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="stocks")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    purchase_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    commission_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=10.0
    )

    class Meta:
        unique_together = ["product", "warehouse"]
        verbose_name = _("Stock")
        verbose_name_plural = _("Stock")
        ordering = ["product"]

    def __str__(self):
        return f"{self.product.tool} - {self.quantity} in {self.warehouse.name}"


class StockMovement(TimeStampedModel):
    class MovementType(models.TextChoices):
        IN = "in", _("In")
        OUT = "out", _("Out")
        TRANSFER = "transfer", _("Transfer")

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="stockmovement"
    )
    from_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="stock_out_movements",
        blank=True,
        null=True,
    )
    to_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="stock_in_movements",
        blank=True,
        null=True,
    )
    movement_type = models.CharField(max_length=10, choices=MovementType.choices)
    quantity = models.PositiveIntegerField()
    remarks = models.TextField(blank=True)

    def clean(self):
        if self.movement_type == self.MovementType.TRANSFER:
            if not self.from_warehouse or not self.to_warehouse:
                raise ValidationError(
                    "Transfer must include both source and destination warehouses."
                )
            if self.from_warehouse == self.to_warehouse:
                raise ValidationError(
                    "Source and destination warehouses cannot be the same."
                )
        elif self.movement_type == self.MovementType.IN:
            if not self.to_warehouse:
                raise ValidationError(
                    "Incoming stock must specify the destination warehouse."
                )
        elif self.movement_type == self.MovementType.OUT:
            if not self.from_warehouse:
                raise ValidationError(
                    "Outgoing stock must specify the source warehouse."
                )

    def __str__(self):
        return f"{self.movement_type.upper()} - {self.product.tool} x{self.quantity}"


class Sale(TimeStampedModel):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="sales")
    product = models.ForeignKey("Product", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    selling_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        errors = {}
        if self.quantity is None or self.quantity <= 0:
            errors["quantity"] = _("Quantity must be positive and set.")
        if self.selling_price_per_unit is None:
            errors["selling_price_per_unit"] = _("Selling price must be set.")

        stock = self.get_stock()
        if not stock:
            errors["product"] = _("No stock entry found for this product.")
        elif stock.quantity < self.quantity:
            errors["quantity"] = _("Not enough stock available.")

        if errors:
            raise ValidationError(errors)

    def get_stock(self):
        stock = self.product.stock_set.first()
        if not stock:
            raise ValidationError(_("No stock available for this product."))
        return stock

    def get_total_revenue(self):
        return self.selling_price_per_unit * self.quantity

    def get_total_cost(self):
        stock = self.get_stock()
        return stock.purchase_price_per_unit * self.quantity

    def get_seller_commission_amount(self):
        """
        Seller commission is commission_percent % of purchase price * quantity,
        independent of selling price.
        """
        stock = self.get_stock()
        commission_rate = stock.commission_percent / Decimal(100)
        commission_amount = (
            stock.purchase_price_per_unit * commission_rate * self.quantity
        )
        return commission_amount

    def get_seller_profit(self):
        """
        Seller profit = commission + extra profit from selling price above purchase price.
        If selling price <= purchase price, extra profit is zero.
        """
        stock = self.get_stock()
        commission = self.get_seller_commission_amount()

        extra_profit_per_unit = (
            self.selling_price_per_unit - stock.purchase_price_per_unit
        )
        if extra_profit_per_unit < 0:
            extra_profit_per_unit = Decimal("0.0")

        extra_profit = extra_profit_per_unit * self.quantity
        return commission + extra_profit

    def get_company_profit(self):
        """
        Company profit = total revenue - total cost - seller commission only.
        Note: seller commission is deducted here, not full seller profit.

        """
        total_revenue = self.get_total_revenue()
        total_cost = self.get_total_cost()
        seller_commission = self.get_seller_commission_amount()

        return total_revenue - total_cost - seller_commission

    @transaction.atomic
    def process_sale(self):
        stock = self.get_stock()
        if stock.quantity < self.quantity:
            raise ValidationError(_("Not enough stock to complete the sale."))
        stock.quantity -= self.quantity
        stock.save()
        self.save()

    def __str__(self):
        return f"Sale: {self.quantity} x {self.product.tool} at ${self.selling_price_per_unit}"

    class Meta:
        ordering = ["-created_at"]
