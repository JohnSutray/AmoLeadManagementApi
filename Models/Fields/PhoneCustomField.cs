﻿ namespace AmoLeadManagementApi.Models.Fields {
  public class PhoneCustomField : CustomField {
    public PhoneCustomField(string phone) {
      Code = "PHONE";
      Enum = 1691756;
      Id = 704938;
      IsSystem = true;
      Value = phone;
    }
  }
}