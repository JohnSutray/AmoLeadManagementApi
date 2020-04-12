﻿using System.Linq;
 using AmoLeadManagementApi.Constants;
 using AmoLeadManagementApi.Models.Fields;

 namespace AmoLeadManagementApi.Models {
  public class Lead: IDto {
    public string Name { get; set; }
    public string[] Tags { get; set; }
    public int ContactId { get; set; }
    public CustomField[] CustomFields { get; set; }

    public object ToDto() => new {
      name = Name,
      tags = Tags,
      contacts_id = new[] {ContactId},
      responsible_user_id = AmoConstants.ResponsibleUserId,
      custom_fields = CustomFields.Select(field => field.ToDto())
    };
  }
}