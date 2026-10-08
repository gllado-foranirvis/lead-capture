import type * as React from 'react';

type Layout = 'auto' | 'mobile' | 'desktop';

export interface ButtonProps {
  /** solid: píndola negra; outline: contorn sobre fons clar; outline-light: contorn blanc sobre foto o navy; brand: blau acer. */
  variant?: 'solid' | 'outline' | 'outline-light' | 'brand' | 'link';
  size?: 'md' | 'sm';
  full?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}

export interface NavLink { label: string; href?: string; active?: boolean; /** Mostra la fletxa de desplegable. */ menu?: boolean }

export interface SiteHeaderProps {
  brand?: string;
  homeHref?: string;
  links: NavLink[];
  /** Selector d'idioma, p. ex. "ES". */
  lang?: string;
  menuLabel?: string;
  defaultOpen?: boolean;
  layout?: Layout;
  className?: string;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  /** URL de la foto de fons; sense ella, fons navy-800. */
  image?: string;
  cta?: { label: string; href: string };
  align?: 'center' | 'start';
  layout?: Layout;
  className?: string;
}

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  level?: 1 | 2 | 3 | 4;
  layout?: Layout;
  className?: string;
}

export interface ImageCardProps {
  title: string;
  description?: string;
  image?: string;
  alt?: string;
  /** Text del marcador de posició quan no hi ha imatge. */
  placeholder?: string;
  className?: string;
}

export interface ProductCardProps {
  title: string;
  description?: string;
  image?: string;
  alt?: string;
  placeholder?: string;
  cta?: { label: string; href: string };
  className?: string;
}

export interface BrandRowProps {
  title: string;
  /** Logotip: URL d'imatge o un node. */
  logo: string | React.ReactNode;
  logoAlt?: string;
  /** Un paràgraf per element. */
  children: string | string[];
  /** Posa el logotip a la dreta des de 768px. */
  reverse?: boolean;
  layout?: Layout;
  className?: string;
}

export interface FeatureItemProps {
  title: string;
  description?: string;
  /** Icona SVG de 32px. */
  icon?: React.ReactNode;
  className?: string;
}

export interface FieldProps {
  label: string;
  name?: string;
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

export interface SiteFooterProps {
  /** Icones de xarxes socials, subministrades pel consumidor. */
  social?: React.ReactNode;
  contactHeading?: string;
  contacts?: { label: string; href: string }[];
  newsletter?: { heading?: string; label?: string; placeholder?: string; button?: string; onSubmit?: (e: React.FormEvent) => void };
  copyright?: string;
  layout?: Layout;
  className?: string;
}

export interface SelectProps {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  /** Text de l'opció buida inicial, p. ex. "Elige un producto". */
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export interface CheckboxProps {
  /** Text de l'etiqueta; pot contenir un enllaç (política de privacitat). */
  children: React.ReactNode;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface NoticeProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** md: línia en bloc; lg: centrat amb icona gran (pantalla de confirmació). */
  size?: 'md' | 'lg';
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface PdfCardProps {
  title: string;
  /** Línia secundària, p. ex. "PDF · 2,4 MB". */
  meta?: string;
  /** Si hi és, tota la targeta és un enllaç de descàrrega. */
  href?: string;
  className?: string;
}

export interface ChoiceChipsProps {
  legend?: string;
  options: { value: string; label: string }[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface LangSwitchProps {
  languages: { code: string }[];
  value?: string;
  defaultValue?: string;
  /** Nom accessible del selector. */
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export interface SectionLabelProps {
  as?: 'p' | 'h2' | 'h3' | 'span';
  children: React.ReactNode;
  className?: string;
}

export interface LegalLinksProps {
  links: { label: string; href?: string }[];
  label?: string;
  className?: string;
}

export interface RadioGroupProps {
  /** La pregunta; es mostra com a llegenda del grup. */
  legend: string;
  options: { value: string; label: string; disabled?: boolean }[];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface CheckboxGroupProps {
  legend: string;
  options: { value: string; label: string; disabled?: boolean }[];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  /** Valors marcats (controlat). */
  values?: string[];
  defaultValues?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface FigureProps {
  src?: string;
  alt?: string;
  /** Proporció CSS, p. ex. "16 / 9" (per defecte) o "4 / 3". */
  ratio?: string;
  caption?: string;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    TSF: {
      RadioGroup: React.FC<RadioGroupProps>;
      CheckboxGroup: React.FC<CheckboxGroupProps>;
      Figure: React.FC<FigureProps>;
      Select: React.FC<SelectProps>;
      Checkbox: React.FC<CheckboxProps>;
      Notice: React.FC<NoticeProps>;
      PdfCard: React.FC<PdfCardProps>;
      ChoiceChips: React.FC<ChoiceChipsProps>;
      LangSwitch: React.FC<LangSwitchProps>;
      SectionLabel: React.FC<SectionLabelProps>;
      LegalLinks: React.FC<LegalLinksProps>;
      Button: React.FC<ButtonProps>;
      SiteHeader: React.FC<SiteHeaderProps>;
      Hero: React.FC<HeroProps>;
      SectionHeading: React.FC<SectionHeadingProps>;
      ImageCard: React.FC<ImageCardProps>;
      ProductCard: React.FC<ProductCardProps>;
      BrandRow: React.FC<BrandRowProps>;
      FeatureItem: React.FC<FeatureItemProps>;
      Field: React.FC<FieldProps>;
      SiteFooter: React.FC<SiteFooterProps>;
    };
  }
}
