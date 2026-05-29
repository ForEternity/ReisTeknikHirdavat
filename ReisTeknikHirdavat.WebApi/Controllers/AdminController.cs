using MediatR;
using Microsoft.AspNetCore.Mvc;
using ReisTeknikHirdavat.Application.Features.Orders.Queries.GetAdminDashboard;
using ReisTeknikHirdavat.Application.Features.Orders.Queries.GetAdminOrders;
using ReisTeknikHirdavat.Domain.Enums;

namespace ReisTeknikHirdavat.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard-metrics")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        var metrics = await _mediator.Send(new GetAdminDashboardQuery());
        return Ok(metrics);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? search,
        [FromQuery] OrderStatus? status,
        [FromQuery] OrderSource? source)
    {
        var orders = await _mediator.Send(new GetAdminOrdersQuery(search, status, source));
        return Ok(orders);
    }
}