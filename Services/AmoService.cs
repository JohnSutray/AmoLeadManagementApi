using System.Net.Http;
using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi;
using AmoLeadManagementApi.Extensions.Object;
using Newtonsoft.Json;

namespace AmoLeadManagementApi.Services {
  public class AmoService {
    private readonly AmoAuth _amoAuth;
    private readonly HttpClient _client = new HttpClient();

    private string BaseUrl => $"https://{_amoAuth.Domain}.amocrm.ru";
    private string AuthUrl => $"{BaseUrl}/private/api/auth.php";
    private string ContactUrl => $"{BaseUrl}/api/v2/contacts";
    private string LeadUrl => $"{BaseUrl}/api/v2/leads";
    private string NoteUrl => $"{BaseUrl}/api/v2/notes";

    public AmoService(AmoAuth auth) {
      _amoAuth = auth;
    }

    private int GetIdFromAddResult(string result) => (int) result.ToJObject().SelectToken("_embedded.items[0].id");

    private string GetFormattedJsonString(string response) => response.ToJObject().ToString(Formatting.Indented);

    private async Task<HttpResponseMessage> PostAsync(string url, string content) {
      var requestContent = new StringContent(content);
      var response = await _client.PostAsync(url, requestContent);

      return response;
    }

    private async Task Authorize() => await PostAsync(AuthUrl, _amoAuth.ToDto().ToJson());

    private async Task<AmoResult> CreateEntity(string url, IDto entityDto) {
      await Authorize();

      var result = await PostAsync(url, entityDto.ToDto().ToAddDto().ToJson());
      var content = await result.Content.ReadAsStringAsync();

      return new AmoResult {
        EntityId = GetIdFromAddResult(content),
        ResponseJson = GetFormattedJsonString(content),
        ResponseCode = (int) result.StatusCode
      };
    }

    public async Task<AmoResult> CreateLead(Lead lead) => await CreateEntity(LeadUrl, lead);

    public async Task<AmoResult> CreateContact(Contact contact) => await CreateEntity(ContactUrl, contact);

    public async Task<AmoResult> CreateNote(Note note) => await CreateEntity(NoteUrl, note);
  }
}
