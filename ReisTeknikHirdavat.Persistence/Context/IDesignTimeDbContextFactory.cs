using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ReisTeknikHirdavat.Persistence.Context;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Tasarım zamanında migration aracının doğrudan bağlanacağı yerel SQL Server adresi
        var connectionString = "Server=(localdb)\\mssqllocaldb;Database=ReisTeknikHirdavatDb;Trusted_Connection=True;MultipleActiveResultSets=true";

        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}