export async function shareOrCopy({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  await navigator.clipboard?.writeText(url ?? text)
  return 'copied'
}
