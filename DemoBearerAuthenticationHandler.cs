using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

sealed class DemoBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "DemoBearer";

    public DemoBearerAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorization = Request.Headers.Authorization.ToString();

        if (string.IsNullOrWhiteSpace(authorization))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        const string bearerPrefix = "Bearer ";
        if (!authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var token = authorization[bearerPrefix.Length..].Trim();
        if (!DemoIdentityStore.TryGetByToken(token, out var identity))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid demo bearer token."));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, identity.Id),
            new Claim(ClaimTypes.Name, identity.Username),
            new Claim(ClaimTypes.Role, identity.Role)
        };

        var claimsIdentity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(claimsIdentity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.Headers.WWWAuthenticate = "Bearer realm=\"Gadget Depo Demo\"";
        return Task.CompletedTask;
    }
}

static class DemoIdentityStore
{
    private static readonly DemoIdentity Customer = new(
        "42",
        "customer",
        "Customer",
        "demo123",
        "gadget-customer-token");

    private static readonly DemoIdentity Admin = new(
        "1",
        "admin",
        "Admin",
        "admin123",
        "gadget-admin-token");

    public static bool TryLogin(string username, string password, out DemoIdentity identity)
    {
        identity = username switch
        {
            "customer" when password == Customer.Password => Customer,
            "admin" when password == Admin.Password => Admin,
            _ => default!
        };

        return identity is not null;
    }

    public static bool TryGetByToken(string token, out DemoIdentity identity)
    {
        identity = token switch
        {
            "gadget-customer-token" => Customer,
            "gadget-admin-token" => Admin,
            _ => default!
        };

        return identity is not null;
    }
}

sealed record DemoIdentity(string Id, string Username, string Role, string Password, string AccessToken);
