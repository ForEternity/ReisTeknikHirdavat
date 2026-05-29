using MediatR;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Application.Features.Products.Commands.SyncTrendyolProducts;

public record SyncTrendyolProductsCommand(string ApiKey, string ApiSecret, string SupplierId) : IRequest<int>;

public class SyncTrendyolProductsCommandHandler : IRequestHandler<SyncTrendyolProductsCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IMarketplaceService _marketplaceService;

    public SyncTrendyolProductsCommandHandler(IApplicationDbContext context, IMarketplaceService marketplaceService)
    {
        _context = context;
        _marketplaceService = marketplaceService;
    }

    public async Task<int> Handle(SyncTrendyolProductsCommand request, CancellationToken cancellationToken)
    {
        // 1. Trendyol API'den ürünleri çek
        var trendyolProducts = await _marketplaceService.FetchProductsFromTrendyolAsync(
            request.ApiKey, request.ApiSecret, request.SupplierId);

        if (!trendyolProducts.Any()) return 0;

        // 2. Mevcut ürünleri barkoda göre hafızaya (RAM) çekerek DB yükünü azalt
        var barcodes = trendyolProducts.Select(p => p.Barcode).ToList();
        var existingProducts = await _context.Products
            .Include(p => p.Images)
            .Where(p => barcodes.Contains(p.Barcode))
            .ToDictionaryAsync(p => p.Barcode, cancellationToken);

        int importedCount = 0;

        foreach (var tProd in trendyolProducts)
        {
            if (existingProducts.TryGetValue(tProd.Barcode, out var existingProduct))
            {
                // Ürün zaten var -> Stok ve Fiyat güncelle (Production Eşitlemesi)
                existingProduct.TrendyolStock = tProd.TrendyolStock;
                existingProduct.LocalStock = tProd.LocalStock;
                existingProduct.Price = tProd.Price;
                existingProduct.DiscountPrice = tProd.DiscountPrice;
                existingProduct.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Ürün sistemde yok -> Yeni hırdavat ürünü olarak ekle
                await _context.Products.AddAsync(tProd, cancellationToken);
                importedCount++;
            }
        }

        // 3. Değişiklikleri veritabanına tek bir transaction ile bas
        await _context.SaveChangesAsync(cancellationToken);
        return importedCount;
    }
}