using MediatR;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ReisTeknikHirdavat.Application.Features.Orders.Queries.GetAdminDashboard;

// 1. QUERY TANIMI
public record GetAdminDashboardQuery : IRequest<AdminDashboardDto>;

// 2. VERİ TRANSFER NESNELERİ (DTO)
public record AdminDashboardDto
{
    public decimal TotalSalesAmount { get; set; }
    public int TotalOrderCount { get; set; }
    public int CriticalStockCount { get; set; }
    public int WebOrderCount { get; set; }
    public int TrendyolOrderCount { get; set; }
    public int HepsiburadaOrderCount { get; set; }
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public record RecentOrderDto(
    string OrderNumber,
    string CustomerName,
    decimal TotalAmount,
    string Status,
    string Source,
    DateTime CreatedAt);

// 3. HANDLER LOJİĞİ
public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
    {
        var activeOrdersQuery = _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled);

        var totalSales = await activeOrdersQuery.SumAsync(o => o.TotalAmount, cancellationToken);
        var totalOrders = await _context.Orders.AsNoTracking().CountAsync(cancellationToken);

        var criticalStock = await _context.Products
            .AsNoTracking()
            .CountAsync(p => p.LocalStock <= p.CriticalStockLevel, cancellationToken);

        var channelCounts = await activeOrdersQuery
            .GroupBy(o => o.Source)
            .Select(g => new { Source = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Source, g => g.Count, cancellationToken);

        var recentOrders = await _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto(
                o.OrderNumber,
                o.CustomerName,
                o.TotalAmount,
                o.Status.ToString(),
                o.Source.ToString(),
                o.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new AdminDashboardDto
        {
            TotalSalesAmount = totalSales,
            TotalOrderCount = totalOrders,
            CriticalStockCount = criticalStock,
            WebOrderCount = channelCounts.GetValueOrDefault(OrderSource.Web, 0),
            TrendyolOrderCount = channelCounts.GetValueOrDefault(OrderSource.Trendyol, 0),
            HepsiburadaOrderCount = channelCounts.GetValueOrDefault(OrderSource.Hepsiburada, 0),
            RecentOrders = recentOrders
        };
    }
}