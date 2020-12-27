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

    public LeadController(LeadService leadService) =>
      _leadService = leadService;

    [HttpPost]
    public ActionResult CreateLead(CreateLeadDto dto) {
      Task.Run(async () => {
        try {
          await _leadService.CreateLead(dto);
        }
        catch (Exception e) {
          Console.WriteLine(e);
        }
      });

      return Ok();
    }
  }
}
