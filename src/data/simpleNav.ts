// The simple site's pages, in menu order.
export type SPage = 'home' | 'temple' | 'poojas' | 'events' | 'maala' | 'swamis' | 'gallery' | 'visit';
export const simpleNav = (base: string): { key: SPage; href: string; label: string }[] => {
  const home = `${base}simple/`;
  return [
    { key: 'home', href: home, label: 'Home' },
    { key: 'temple', href: `${home}temple/`, label: 'Our Temple' },
    { key: 'poojas', href: `${home}poojas/`, label: 'Poojas and Sevas' },
    { key: 'events', href: `${home}events/`, label: 'Events' },
    { key: 'maala', href: `${home}maala-dharana/`, label: 'Maala Dharana' },
    { key: 'swamis', href: `${home}swamis/`, label: 'Guruswamys' },
    { key: 'gallery', href: `${home}gallery/`, label: 'Gallery' },
    { key: 'visit', href: `${home}visit/`, label: 'Visit' },
  ];
};
