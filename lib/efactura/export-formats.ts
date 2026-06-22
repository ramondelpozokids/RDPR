function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

type FacturaeInput = {
  invoice: {
    number: string
    issueDate: Date
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    notes: string | null
    complianceHash: string | null
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>
  }
  company: {
    name: string
    taxId: string | null
    email: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    country: string
  }
  customer: {
    name: string
    taxId: string | null
    email: string | null
    address: string | null
    city: string | null
  }
}

export function validateFacturaeReady(input: FacturaeInput): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  if (!input.company.taxId) errors.push("La empresa emisora debe tener NIF/CIF configurado.")
  if (!input.customer.taxId) errors.push("El cliente debe tener NIF/CIF para factura electrónica B2B.")
  if (input.invoice.items.length === 0) errors.push("La factura no tiene líneas.")
  return { ok: errors.length === 0, errors }
}

/** Facturae 3.2.2 simplificado — válido como export estructurado; integración AEAT en roadmap. */
export function generateFacturaeXml(input: FacturaeInput): string {
  const { invoice, company, customer } = input
  const issue = invoice.issueDate.toISOString().slice(0, 10)
  const sellerTax = company.taxId ?? "00000000A"
  const buyerTax = customer.taxId ?? "00000000A"

  const invoiceLines = invoice.items
    .map(
      (line, idx) => `
      <InvoiceLine>
        <ItemDescription>${esc(line.description)}</ItemDescription>
        <Quantity>${line.quantity}</Quantity>
        <UnitPriceWithoutTax>${line.unitPrice.toFixed(2)}</UnitPriceWithoutTax>
        <TotalCost>${line.total.toFixed(2)}</TotalCost>
        <TaxesOutputs>
          <Tax>
            <TaxTypeCode>01</TaxTypeCode>
            <TaxRate>${invoice.taxRate.toFixed(2)}</TaxRate>
          </Tax>
        </TaxesOutputs>
        <LineItemPeriod>
          <SequenceNumber>${idx + 1}</SequenceNumber>
        </LineItemPeriod>
      </InvoiceLine>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:fe="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${esc(invoice.number)}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount>${invoice.total.toFixed(2)}</TotalInvoicesAmount>
      <TotalOutstandingAmount>${invoice.total.toFixed(2)}</TotalOutstandingAmount>
      <TotalExecutableAmount>${invoice.total.toFixed(2)}</TotalExecutableAmount>
      <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
    </Batch>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification><TaxIdentificationNumber>${esc(sellerTax)}</TaxIdentificationNumber><ResidenceTypeCode>R</ResidenceTypeCode></TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(company.name)}</CorporateName>
        <AddressInSpain>
          <Address>${esc(company.address ?? "—")}</Address>
          <PostCode>${esc(company.postalCode ?? "00000")}</PostCode>
          <Town>${esc(company.city ?? "—")}</Town>
          <Province>${esc(company.city ?? "—")}</Province>
          <CountryCode>${esc(company.country)}</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification><TaxIdentificationNumber>${esc(buyerTax)}</TaxIdentificationNumber><ResidenceTypeCode>R</ResidenceTypeCode></TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(customer.name)}</CorporateName>
        <AddressInSpain>
          <Address>${esc(customer.address ?? "—")}</Address>
          <PostCode>00000</PostCode>
          <Town>${esc(customer.city ?? "—")}</Town>
          <Province>${esc(customer.city ?? "—")}</Province>
          <CountryCode>ESP</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${esc(invoice.number)}</InvoiceNumber>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${issue}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      <TaxesOutputs>
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${invoice.taxRate.toFixed(2)}</TaxRate>
          <TaxableBase><TotalAmount>${invoice.subtotal.toFixed(2)}</TotalAmount></TaxableBase>
          <TaxAmount><TotalAmount>${invoice.taxAmount.toFixed(2)}</TotalAmount></TaxAmount>
        </Tax>
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${invoice.subtotal.toFixed(2)}</TotalGrossAmount>
        <TotalGeneralDiscounts>0.00</TotalGeneralDiscounts>
        <TotalGrossAmountBeforeTaxes>${invoice.subtotal.toFixed(2)}</TotalGrossAmountBeforeTaxes>
        <TotalTaxOutputs>${invoice.taxAmount.toFixed(2)}</TotalTaxOutputs>
        <InvoiceTotal>${invoice.total.toFixed(2)}</InvoiceTotal>
        <TotalOutstandingAmount>${invoice.total.toFixed(2)}</TotalOutstandingAmount>
        <TotalExecutableAmount>${invoice.total.toFixed(2)}</TotalExecutableAmount>
      </InvoiceTotals>
      <Items>${invoiceLines}
      </Items>
      <AdditionalData>
        <InvoiceAdditionalInformation>${esc(invoice.notes ?? "")}${invoice.complianceHash ? ` | Huella RDPR: ${invoice.complianceHash}` : ""}</InvoiceAdditionalInformation>
      </AdditionalData>
    </Invoice>
  </Invoices>
</fe:Facturae>`
}

export function generateUblXml(input: FacturaeInput): string {
  const { invoice, company, customer } = input
  const issue = invoice.issueDate.toISOString().slice(0, 10)
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${esc(invoice.number)}</cbc:ID>
  <cbc:IssueDate>${issue}</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(company.name)}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme><cbc:CompanyID>${esc(company.taxId ?? "")}</cbc:CompanyID></cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(customer.name)}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme><cbc:CompanyID>${esc(customer.taxId ?? "")}</cbc:CompanyID></cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="EUR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${invoice.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${invoice.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`
}
