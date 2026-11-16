// One calendar file per dated event: /cal/<id>.ics
import type { APIRoute } from 'astro';
import { dated, ics } from '../../data/events';

export const getStaticPaths = () => dated.map((e) => ({ params: { id: e.id }, props: { e } }));
export const GET: APIRoute = ({ props }) => new Response(ics(props.e), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
