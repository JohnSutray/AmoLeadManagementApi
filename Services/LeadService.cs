using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi.Models.Fields;

namespace AmoLeadManagementApi.Services {
  public class LeadService {
    private AmoService AmoService { get; }

    public LeadService(AmoService manager) => AmoService = manager;

    public async Task<(AmoResult contactResult, AmoResult leadResult)> CreateLead(CreateLeadDto dto) {
      var fields = new CustomField[] {
        new InfoCustomField(dto.Info),
        new PhoneCustomField(dto.Phone),
        new SourceCustomField(dto.Source),
        new UtmCampaignCustomField(dto.UtmCampaign),
        new UtmContentCustomField(dto.UtmContent),
        new UtmMediumCustomField(dto.UtmMedium),
        new UtmSourceCustomField(dto.UtmSource),
        new UtmTermCustomField(dto.UtmTerm),
      };

      var contactResult = await AmoService.CreateContact(new Contact {
        Name = dto.ContactName,
        CustomFields = fields
      });

      var leadResult = await AmoService.CreateLead(new Lead {
        Name = dto.LeadName,
        Tags = dto.Tags,
        ContactId = contactResult.EntityId,
        CustomFields = fields
      });

      await AmoService.CreateNote(new Note {
        Text = dto.NoteContent,
        LeadId = leadResult.EntityId
      });

      return (
        contactResult,
        leadResult
      );
    }
  }
}
