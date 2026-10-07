export function parseOAuthError(
  search: string,
  deniedMessage: string = 'Access denied',
): string | null {
  if (!search) return null;
  const cleanSearch = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(cleanSearch);
  const err = params.get('oauth_error') || params.get('error_description') || params.get('error');

  if (!err) return null;
  if (err === 'access_denied') {
    return deniedMessage;
  }
  return decodeURIComponent(err);
}

export function isUserAuthenticated(me: any): boolean {
  return Boolean(me && (me.id || me.craftWorldUid));
}
