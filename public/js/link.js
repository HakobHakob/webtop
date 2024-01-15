document.addEventListener("DOMContentLoaded", () => {
  const pagePathName = window.location.pathname

  const navLinks = document.querySelectorAll(".menu-li > a")
  navLinks.forEach((link) => {
    const hrefPath = link.getAttribute("href")
    if (pagePathName === hrefPath) {
      if (link.classList.contains("activeLink")) {
        link.classList.remove("activeLink")
      } else {
        link.classList.add("activeLink")
      }
    }
  })
})
