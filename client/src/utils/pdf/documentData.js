import { formatCurrency, formatDate, safeText } from './shared';

export function getPersonDisplayName(person) {
  if (!person) return '';
  return safeText(
    person.name
      || [person.firstName, person.lastName].filter(Boolean).join(' ')
      || person.displayName
      || person.fullName
      || person.email,
    ''
  );
}

export function getCompanyDisplayName(company) {
  if (!company) return '';
  return safeText(company.name || company.companyName || company.displayName, '');
}

function collectKnownFields(source, fields) {
  return fields
    .map((field) => {
      const rawValue = source?.[field.key];
      const value = safeText(field.format ? field.format(rawValue, source) : rawValue, '');
      return value ? { label: field.label, value } : null;
    })
    .filter(Boolean);
}

function collectAdditionalDealInfo(source = {}) {
  const fields = [
    { key: 'status', label: 'Status', format: (value) => safeText(String(value).replace(/_/g, ' '), '') },
    { key: 'category', label: 'Category' },
    { key: 'incoterm', label: 'Incoterm' },
    { key: 'destinationCountry', label: 'Destination Country' },
    { key: 'deliveryTimeline', label: 'Delivery Timeline' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'remarks', label: 'Additional Notes' },
    { key: 'notes', label: 'Notes' },
    { key: 'currency', label: 'Currency' },
    { key: 'paymentTerms', label: 'Payment Terms' },
    { key: 'shippingTerms', label: 'Shipping Terms' },
    { key: 'tradeTerms', label: 'Trade Terms' },
    { key: 'validUntil', label: 'Valid Until', format: (value) => formatDate(value) },
    { key: 'targetPrice', label: 'Target Price', format: (value, original) => formatCurrency(value, original.currency || 'USD') },
    { key: 'createdAt', label: 'Created At', format: (value) => formatDate(value) },
    { key: 'updatedAt', label: 'Updated At', format: (value) => formatDate(value) },
  ];

  const baseItems = collectKnownFields(source, fields);
  const customFields = source?.additionalInfo && typeof source.additionalInfo === 'object'
    ? Object.entries(source.additionalInfo).map(([key, value]) => ({
        label: key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' '),
        value: safeText(value, ''),
      }))
    : [];

  return [...baseItems, ...customFields].filter((item) => safeText(item.value, '') !== '');
}

export function buildDocumentContext({
  user,
  company,
  request,
  deal,
  viewerRole,
}) {
  const source = request || deal || {};
  const currentUserName = getPersonDisplayName(user) || 'User';
  const companyName = getCompanyDisplayName(company)
    || safeText(source?.buyerCompanyName || source?.supplierCompanyName || source?.companyName, '');

  const currentPartyName = safeText(companyName || currentUserName, currentUserName);
  const buyerCandidate = safeText(
    source?.buyerUserName
      || source?.buyerUser?.name
      || [source?.buyerUser?.firstName, source?.buyerUser?.lastName].filter(Boolean).join(' ')
      || source?.buyerCompanyName
      || source?.buyerCompany?.name
      || source?.buyerHint
      || source?.buyerName,
    ''
  );
  const supplierCandidate = safeText(
    source?.supplierUserName
      || source?.supplierUser?.name
      || [source?.supplierUser?.firstName, source?.supplierUser?.lastName].filter(Boolean).join(' ')
      || source?.supplierCompanyName
      || source?.supplierCompany?.name
      || source?.supplierHint
      || source?.supplierName,
    ''
  );

  const isSupplierView = viewerRole === 'supplier';
  const buyerName = isSupplierView ? (buyerCandidate || 'Buyer pending') : currentPartyName;
  const supplierName = isSupplierView ? currentPartyName : (supplierCandidate || 'Supplier pending');
  const buyerCompanyName = isSupplierView ? (buyerCandidate || 'Buyer company pending') : currentPartyName;
  const supplierCompanyName = isSupplierView ? currentPartyName : (supplierCandidate || 'Seller company pending');
  const buyerAddress = safeText(source?.buyerAddress || source?.buyerCompanyAddress || source?.buyerCompany?.address, '');
  const supplierAddress = safeText(source?.supplierAddress || source?.supplierCompanyAddress || source?.supplierCompany?.address, '');
  const buyerRegistrationNumber = safeText(source?.buyerRegistrationNumber || source?.buyerCompanyRegNo || source?.buyerCompany?.registrationNumber, '');
  const supplierRegistrationNumber = safeText(source?.supplierRegistrationNumber || source?.supplierCompanyRegNo || source?.supplierCompany?.registrationNumber, '');

  const dealName = safeText(source?.dealName || source?.productName || source?.title || source?.subject, 'Deal');
  const quantity = safeText(source?.quantity || source?.orderQuantity || source?.requestedQuantity, '');
  const price = source?.price ?? source?.targetPrice ?? source?.agreedPrice ?? source?.unitPrice ?? '';
  const currency = source?.currency || 'USD';
  const dealId = safeText(source?.dealId || source?._id || source?.id, '');
  const date = formatDate(source?.createdAt || new Date());
  const generatedOn = formatDate(new Date());

  const additionalDetails = collectAdditionalDealInfo({
    ...source,
    buyerCompanyName: source?.buyerCompanyName || companyName || '',
    supplierCompanyName: source?.supplierCompanyName || '',
  });

  return {
    userName: currentUserName,
    companyName,
    buyerName,
    supplierName,
    buyerCompanyName,
    supplierCompanyName,
    buyerAddress,
    supplierAddress,
    buyerRegistrationNumber,
    supplierRegistrationNumber,
    dealName,
    quantity,
    price,
    formattedPrice: price === '' ? '—' : formatCurrency(price, currency),
    currency,
    dealId,
    date,
    generatedOn,
    source,
    additionalDetails,
    summaryLines: [
      { label: 'Buyer Name', value: buyerName },
      { label: 'Supplier Name', value: supplierName },
      { label: 'Company Name', value: companyName || '—' },
      { label: 'Deal Name', value: dealName },
      { label: 'Quantity', value: quantity ? String(quantity) : '—' },
      { label: 'Price', value: price === '' ? '—' : formatCurrency(price, currency) },
      { label: 'Deal ID', value: dealId || '—' },
      { label: 'Date', value: date },
    ],
  };
}
