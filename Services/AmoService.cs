using System.Net.Http;
using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using ConsoleApp1;

namespace AmoLeadManagementApi.Services {
  public class AmoService {
    private AmoAuth AmoAuth { get; }
    private HttpClient Client { get; }

    private string BaseUrl => $"https://{AmoAuth.Domain}.amocrm.ru";
    private string AuthUrl => $"{BaseUrl}/private/api/auth.php";
    private string ContactUrl => $"{BaseUrl}/api/v2/contacts";
    private string LeadUrl => $"{BaseUrl}/api/v2/leads";
    private string NoteUrl => $"{BaseUrl}/api/v2/notes";

    public AmoService(
      AmoAuth auth,
      HttpClient client
    ) {
      AmoAuth = auth;
      Client = client;
    }

    private int GetIdFromAddResult(string result) => (int) result.ToJObject().SelectToken("_embedded.items[0].id");

    private async Task<string> PostAsync(string url, string content) {
      var requestContent = new StringContent(content);
      var response = await Client.PostAsync(url, requestContent);

      return await response.Content.ReadAsStringAsync();
    }

    private async Task Authorize() => await PostAsync(AuthUrl, AmoAuth.ToDto().ToJson());

    private async Task<int> CreateEntity(string url, IDto entityDto) {
      await Authorize();

      var result = await PostAsync(
        url,
        entityDto.ToDto().ToAddDto().ToJson()
      );

      return GetIdFromAddResult(result);
    }

    public async Task<int> CreateLead(Lead lead) => await CreateEntity(LeadUrl, lead);

    public async Task<int> CreateContact(Contact contact) => await CreateEntity(ContactUrl, contact);

    public async Task<int> CreateNote(Note note) => await CreateEntity(NoteUrl, note);
  }
}