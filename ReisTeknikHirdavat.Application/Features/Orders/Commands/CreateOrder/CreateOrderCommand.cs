using MediatR;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Entities;
using ReisTeknikHirdavat.Domain.Enums;

namespace ReisTeknikHirdavat.Application.Features.Orders.Commands.CreateOrder;

public record OrderItemDto(Guid ProductId, int Quantity);

public record CreateOrderCommand(
    Guid CustomerId, string CustomerName, string Email, string PhoneNumber,
    string ShippingAddress, string BillingAddress, string? TaxOffice, string? TaxNumber, string? CompanyName,
    string UserIpAddress, bool KvkkApproved, bool MssApproved,
    List<OrderItemDto> Items) : IRequest<Guid>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Yasal Zorunluluk Denetimi (KVKK ve MSS zorunludur)
        if (!request.KvkkApproved || !request.MssApproved)
            throw new Exception("Yasal sözleşmeler ve KVKK metni onaylanmadan sipariş oluşturulamaz.");

        // 2. Sipariş Edilen Ürünleri DB'den Çek ve Stok Kontrolü Yap
        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var order = new Order
        {
            OrderNumber = $"RTH{DateTime.Now:yyyyMMdd}{new Random().Next(1000, 9999)}",
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            ShippingAddress = request.ShippingAddress,
            BillingAddress = request.BillingAddress,
            TaxOffice = request.TaxOffice,
            TaxNumber = request.TaxNumber,
            CompanyName = request.CompanyName,
            UserIpAddress = request.UserIpAddress,
            KvkkApproved = request.KvkkApproved,
            MssApproved = request.MssApproved,
            Source = OrderSource.Web,
            Status = OrderStatus.New
        };

        decimal totalAmount = 0;

        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                throw new Exception("Sistemde bulunamayan bir ürün sepete eklenmiş.");

            if (product.LocalStock < itemDto.Quantity)
                throw new Exception($"Yetersiz stok! Ürün: {product.Name}, Mevcut Stok: {product.LocalStock}");

            // Stoktan Düşme (Production standardı isolation level korunur)
            product.LocalStock -= itemDto.Quantity;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Sku = product.Sku,
                Quantity = itemDto.Quantity,
                Price = product.DiscountPrice ?? product.Price
            };

            order.OrderItems.Add(orderItem);
            totalAmount += orderItem.Price * orderItem.Quantity;
        }

        order.TotalAmount = totalAmount;

        await _context.Orders.AddAsync(order, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return order.Id;
    }
}