using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ReisTeknikHirdavat.Persistence.Context;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "postgresql://postgres:agMiWZkfsnsdDRWSryyIUodFooTSdVoO@eternity.railway.internal:5432/railway";


        optionsBuilder.UseNpgsql(NormalizePostgresConnectionString(connectionString));

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    private static string NormalizePostgresConnectionString(string connectionString)
    {
        if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':', 2);

        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var database = uri.AbsolutePath.TrimStart('/');

        return
            $"Host={uri.Host};" +
            $"Port={uri.Port};" +
            $"Database={database};" +
            $"Username={username};" +
            $"Password={password};" +
            $"Ssl Mode=Prefer;" +
            $"Trust Server Certificate=true";
    }
}
