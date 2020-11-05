using System;
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

    [Route("session")]
    [HttpPost]
    public ActionResult IndicateSession(AdditionalInfo info) {
      Task.Run(async () => {
        try {
          await _notificationService.NotifyStart(info.Id, info.Info);
        }
        catch (Exception e) {
          Console.WriteLine(e);
        }
      });

      return Ok();
    }

    [HttpPost]
    public ActionResult CreateLead(CreateLeadDto dto) {
      Task.Run(async () => {
        try {
          var (contactResult, leadResult) = await _leadService.CreateLead(dto);
          await _notificationService.Notify(dto, contactResult, leadResult);
        }
        catch (Exception e) {
          Console.WriteLine(e);
        }
      });

      return Ok();
    }

    [HttpGet]
    public string Test() => "test-endpoint-result";
  }
}
