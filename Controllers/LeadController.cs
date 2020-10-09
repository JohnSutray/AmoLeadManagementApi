using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AmoLeadManagementApi.Controllers {
  [Route("lead")]
  [ApiController]
  public class LeadController : Controller {
    private readonly LeadService _leadService;
    private readonly NotificationService _notificationService;

    public LeadController(
      LeadService leadService,
      NotificationService notificationService
      ) {
      _leadService = leadService;
      _notificationService = notificationService;
    }

    [HttpPost]
    public async Task<ActionResult> CreateLead(CreateLeadDto dto) {
      var (contactResult, leadResult) = await _leadService.CreateLead(dto);

      Task.Run(() => _notificationService.Notify(dto, contactResult, leadResult));

      return Ok();
    }

    [HttpGet]
    public string Test() => "test-endpoint-result";
  }
}
