namespace AmoLeadManagementApi.Models {
  public class CreateLeadDto {
    public string Id { get; set; }
    public string LeadName { get; set; }
    public string ContactName { get; set; }
    public string[] Tags { get; set; }
    public string Info { get; set; }
    public string Phone { get; set; }
    public string Source { get; set; }
    public string UtmCampaign { get; set; }
    public string UtmContent { get; set; }
    public string UtmMedium { get; set; }
    public string UtmSource { get; set; }
    public string UtmTerm { get; set; }
    public string NoteContent { get; set; }
  }
}
