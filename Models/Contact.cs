﻿using System.Linq;
 using AmoLeadManagementApi.Constants;
 using AmoLeadManagementApi.Models.Fields;

 namespace AmoLeadManagementApi.Models {
  public class Contact: IDto {
    public string Name { get; set; }
    public CustomField[] CustomFields { get; set; }

    public object ToDto() => new {
      name = Name,
      responsible_user_id = AmoConstants.ResponsibleUserId,
      custom_fields = CustomFields.Select(field => field.ToDto()).ToArray()
    };
  }
}