from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.CategoryCreateView.as_view(), name="category-create"),
    path(
        "categories/<int:pk>/",
        views.CategoryUpdateView.as_view(),
        name="category-update",
    ),
    path(
        "categories/<int:pk>/delete/",
        views.CategoryDeleteView.as_view(),
        name="category-delete",
    ),
    path(
        "attribute-values/",
        views.AttributeValueListCreateView.as_view(),
        name="attribute-value-list-create",
    ),
    path(
        "attribute-values/<int:pk>/",
        views.AttributeValueDetailView.as_view(),
        name="attribute-value-detail",
    ),
    path(
        "attribute-types/",
        views.AttributeTypeListCreateView.as_view(),
        name="attribute-type-list-create",
    ),
    path(
        "attribute-types/<int:pk>/",
        views.AttributeTypeDetailView.as_view(),
        name="attribute-type-detail",
    ),
    path(
        "category/attribute/<int:category_id>/",
        views.CategoryAttributeView.as_view(),
        name="category-attributes",
    ),
]
