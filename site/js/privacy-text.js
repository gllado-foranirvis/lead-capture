export function resolvePrivacyText(t, config, extra1) {
  if (!extra1) return t.privacyText;
  return t.form.privacyText.replace('{responsable}', config.legalName).replace('{email}', config.email);
}
