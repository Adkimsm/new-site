type IconProps = { size?: number };

function Icon({ children, size = 20 }: IconProps & { children: React.ReactNode }) {
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export function GithubIcon(props: IconProps) { return <Icon {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Icon>; }
export function MailIcon(props: IconProps) { return <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>; }
export function RssIcon(props: IconProps) { return <Icon {...props}><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></Icon>; }
export function MenuIcon(props: IconProps) { return <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>; }
export function CloseIcon(props: IconProps) { return <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>; }
export function ListIcon(props: IconProps) { return <Icon {...props}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></Icon>; }
export function CopyIcon(props: IconProps) { return <Icon {...props}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>; }
export function CheckIcon(props: IconProps) { return <Icon {...props}><path d="m5 12 4 4L19 6" /></Icon>; }
export function ArrowUpIcon(props: IconProps) { return <Icon {...props}><path d="m6 10 6-6 6 6M12 4v16" /></Icon>; }
export function ArrowDownIcon(props: IconProps) { return <Icon {...props}><path d="M12 4v16m6-6-6 6-6-6" /></Icon>; }
