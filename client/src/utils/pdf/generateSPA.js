import {
  addBulletList,
  addFooter,
  addParagraph,
  addSectionHeading,
  buildPdfFilename,
  createPdfDoc,
  formatCurrency,
  formatDate,
  safeText,
} from './shared';

export async function generateSPA({
  buyerName,
  supplierName,
  buyerCompanyName,
  supplierCompanyName,
  buyerAddress,
  supplierAddress,
  dealName,
  quantity,
  price,
  currency = 'USD',
  dealId,
  date,
  generatedOn,
  additionalDetails = [],
  source = {},
}) {
  const filename = buildPdfFilename('SPA', dealName);
  const { doc, state } = createPdfDoc({
    title: 'SALE & PURCHASE AGREEMENT (SPA)',
    subtitle: 'Commercial template aligned to the deal request',
    documentCode: 'SPA',
    referenceLabel: 'Deal ID',
    referenceValue: dealId || dealName,
  });

  const formattedDate = safeText(date || generatedOn || formatDate(new Date()), '');
  const formattedPrice = price === '' || price == null ? '—' : formatCurrency(price, currency);
  const inspectionBy = safeText(source.inspectionBy, 'SGS / Bureau Veritas / etc.');
  const paymentMethod = safeText(source.paymentTerms, 'LC / SBLC / TT');
  const paymentTimeline = safeText(source.paymentTimeline, 'Details');
  const incoterm = safeText(source.incoterm, 'FOB/CIF/etc.');
  const portLoading = safeText(source.portOfLoading || source.loadingPort || source.deliveryLocation, 'Port');
  const portDischarge = safeText(source.portOfDischarge || source.dischargePort || source.destinationCountry, 'Port');
  const specification = safeText(source.specifications || source.productSpecification, 'QUALITY/STANDARD');
  const governingLaw = safeText(source.governingLaw, 'JURISDICTION');
  const proofOfFunds = safeText(source.proofOfFundsDays, 'X days');
  const performanceGuarantee = safeText(source.performanceGuaranteeDays, 'X days');
  const exclusivityDays = safeText(source.exclusivityDays, 'X days');
  const penaltyPercent = safeText(source.penaltyPercent, 'X%');
  const commissionPercent = safeText(source.commissionPercent, 'X%');
  const liabilityCap = safeText(source.liabilityCap, 'Indirect or consequential damages excluded');
  const partialShipment = safeText(source.partialShipment, 'allowed/not allowed');
  const arbitration = safeText(source.arbitration, 'ICC rules');
  const forceMajeure = safeText(source.forceMajeure, 'events beyond reasonable control');

  addParagraph(doc, state, `Date: ${formattedDate}`, { size: 10.2, color: [71, 85, 105] });
  addParagraph(doc, state, `Seller: ${supplierCompanyName || supplierName || 'Seller Company'}${supplierAddress ? `, ${supplierAddress}` : ''}`, { size: 10.4, color: [71, 85, 105] });
  addParagraph(doc, state, `Buyer: ${buyerCompanyName || buyerName || 'Buyer Company'}${buyerAddress ? `, ${buyerAddress}` : ''}`, { size: 10.4, color: [71, 85, 105] });

  addSectionHeading(doc, state, '1. Product');
  addParagraph(doc, state, `Product: ${dealName || '—'}\nQuantity: ${safeText(quantity, '—')}\nSpecification: ${specification}`);

  addSectionHeading(doc, state, '2. Price');
  addParagraph(doc, state, `Total Price: ${formattedPrice}`);

  addSectionHeading(doc, state, '3. Delivery Terms');
  addParagraph(doc, state, `Incoterm: ${incoterm}\nPort of Loading: ${portLoading}\nPort of Discharge: ${portDischarge}`);

  addSectionHeading(doc, state, '4. Payment Terms');
  addParagraph(doc, state, `Payment Method: ${paymentMethod}\nPayment Timeline: ${paymentTimeline}`);

  addSectionHeading(doc, state, '5. Inspection');
  addParagraph(doc, state, `Inspection by: ${inspectionBy}\nInspection results shall be final and binding.`);

  addSectionHeading(doc, state, '6. Documents');
  addBulletList(doc, state, [
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading',
    'Certificate of Origin',
    'Inspection Certificate',
  ]);

  addSectionHeading(doc, state, '7. Exclusivity Clause');
  addParagraph(
    doc,
    state,
    `The Seller agrees not to engage with other buyers for the same product under the same terms during the agreed exclusivity period of ${exclusivityDays}.`,
  );

  addSectionHeading(doc, state, '8. Penalty Clause');
  addParagraph(
    doc,
    state,
    `In case of delay or non-performance, a penalty of ${penaltyPercent} per week shall apply, up to a maximum of ${safeText(source.penaltyCap, 'X%')} of the contract value.`,
  );

  addSectionHeading(doc, state, '9. Non-Circumvention Clause');
  addParagraph(
    doc,
    state,
    'The Parties agree not to circumvent each other or bypass introduced parties in any transaction related to this Agreement.',
  );

  addSectionHeading(doc, state, '10. Commission Clause');
  addParagraph(
    doc,
    state,
    `A commission of ${commissionPercent} shall be payable to ${safeText(source.brokerName || source.intermediaryName, 'BROKER/INTERMEDIARY')} upon successful completion of the transaction.`,
  );

  addSectionHeading(doc, state, '11. Partial Shipment Clause');
  addParagraph(doc, state, `Partial shipments are ${partialShipment} under this Agreement.`);

  addSectionHeading(doc, state, '12. Force Majeure');
  addParagraph(
    doc,
    state,
    `Neither Party shall be liable for failure due to events beyond reasonable control, including but not limited to natural disasters, war, or government actions.`,
  );

  addSectionHeading(doc, state, '13. Arbitration Clause');
  addParagraph(doc, state, `Disputes shall be resolved via arbitration under ${arbitration}.`);

  addSectionHeading(doc, state, '14. Governing Law');
  addParagraph(doc, state, `This Agreement shall be governed by the laws of ${governingLaw}.`);

  addSectionHeading(doc, state, '15. Liability Limitation');
  addParagraph(doc, state, `Neither Party shall be liable for ${liabilityCap}.`);

  addSectionHeading(doc, state, '16. Proof of Funds Clause');
  addParagraph(doc, state, `The Buyer shall provide proof of funds within ${proofOfFunds} upon request.`);

  addSectionHeading(doc, state, '17. Performance Guarantee');
  addParagraph(doc, state, `The Seller shall provide a performance guarantee via ${safeText(source.performanceGuaranteeInstrument, 'instrument')} within ${performanceGuarantee}.`);

  if (additionalDetails.length > 0) {
    addSectionHeading(doc, state, 'Additional Deal Information');
    addBulletList(doc, state, additionalDetails.map((item) => `${item.label}: ${item.value}`));
  }

  addSectionHeading(doc, state, '18. Signatures');
  addParagraph(doc, state, 'Seller: ___________________');
  addParagraph(doc, state, 'Name:');
  addParagraph(doc, state, 'Title:');
  addParagraph(doc, state, 'Buyer: ___________________');
  addParagraph(doc, state, 'Name:');
  addParagraph(doc, state, 'Title:');

  addSectionHeading(doc, state, 'Disclaimer');
  addParagraph(doc, state, 'This document is a general template and does not constitute legal advice. Legal review is recommended before execution.');

  addSectionHeading(doc, state, 'Clause Toggles');
  addBulletList(doc, state, [
    '☐ Include Exclusivity Clause',
    '☐ Include Penalty Clause',
    '☐ Include Non-Circumvention Clause',
    '☐ Include Commission / Broker Clause',
    '☐ Include Inspection Clause (SGS)',
    '☐ Include Force Majeure',
    '☐ Include Arbitration (ICC)',
  ]);

  addFooter(doc, state, 'Sale and Purchase Agreement generated by Tradafy');
  const blob = doc.output('blob');
  doc.save(filename);
  return { doc, blob, filename };
}
