const isMobileOrTablet = () =>
  /Mobi|Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(navigator.userAgent)

export const isDesktop = () => !isMobileOrTablet()
