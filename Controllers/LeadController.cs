﻿using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AmoLeadManagementApi.Controllers {
  [Route("lead")]
  [ApiController]
  public class LeadController : Controller {
    private readonly LeadService _leadService;

    public LeadController(LeadService leadService) => _leadService = leadService;

    [HttpPost]
    public async Task<ActionResult> CreateLead(CreateLeadDto dto) {
      await _leadService.CreateLead(dto);

      return Ok();
    }

    [HttpGet]
    public string Test() => "test-endpoint";
  }
}