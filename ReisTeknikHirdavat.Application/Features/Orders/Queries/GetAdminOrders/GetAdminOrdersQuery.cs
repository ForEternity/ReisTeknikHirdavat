using MediatR;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Enums;

namespace ReisTeknikHirdavat.Application.Features.Orders.Queries.GetAdminOrders;

public record GetAdminOrdersQuery(string? SearchTerm, OrderStatus? StatusFilter, OrderSource? SourceFilter) : IRequest<List<AdminOrderListDto>>;

public record AdminOrderListDto(
    Guid Id, string OrderNumber, string CustomerName, string PhoneNumber,
    decimal TotalAmount, string Status, string Source, DateTime CreatedAt);

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, List<AdminOrderListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminOrderListDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders.AsNoTracking();

        // Arama Filtresi (Sipariş No veya Müşteri Adı)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(o => o.OrderNumber.Contains(request.SearchTerm) || o.CustomerName.Contains(request.SearchTerm));
        }

        // Durum Filtresi (Hazırlanıyor, Kargolandı vb.)
        if (request.StatusFilter.HasValue)
        {
            query = query.Where(o => o.Status == request.StatusFilter.Value);
        }

        // Kaynak Filtresi (Web mi Trendyol mu?)
        if (request.SourceFilter.HasValue)
        {
            query = query.Where(o => o.Source == request.SourceFilter.Value);
        }

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new AdminOrderListDto(
                o.Id, o.OrderNumber, o.CustomerName, o.PhoneNumber,
                o.TotalAmount, o.Status.ToString(), o.Source.ToString(), o.CreatedAt
            ))
            .ToListAsync(cancellationToken);
    }
}