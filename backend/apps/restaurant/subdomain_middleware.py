from django.utils.deprecation import MiddlewareMixin


class SubdomainMiddleware(MiddlewareMixin):
    def process_request(self, request):
        host = request.get_host().split(":")[0]
        domain_parts = host.split(".")

        if len(domain_parts) > 2:
            request.subdomain = domain_parts[0]
        else:
            request.subdomain = None
