using AmoLeadManagementApi.Constants;

namespace AmoLeadManagementApi.Models {
  public class Note: IDto {
    public int LeadId { get; set; }
    public string Text { get; set; }

    public object ToDto() => new {
      element_id = LeadId,
      element_type = 2,
      text = Text,
      note_type = 4,
      responsible_user_id = AmoConstants.ResponsibleUserId
    };
  }
}