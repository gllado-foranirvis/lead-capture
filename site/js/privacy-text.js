export function resolvePrivacyText(t, config, extra1) {
  if (!extra1) return t.privacyText;
  return t.form.privacyText.replace('{responsable}', config.legalName).replace('{email}', config.email);
}

// El text va en blocs separats per una línia en blanc (\n\n); sense salts és un sol bloc.
export const paragraphs = (text) => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
