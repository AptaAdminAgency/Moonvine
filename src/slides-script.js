const loading = document.querySelector("#loading");
loading.classList.remove("hidden");
const supabaseUrl = "https://lzjitoimrnfzwwnpktfi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aml0b2ltcm5mend3bnBrdGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTI1ODksImV4cCI6MjA2OTY2ODU4OX0.XrOAZluF1zrBBqr4GqvvyvBAU7pRmdF8mqbE7YK89Ho";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loadSlideFromSupabase() {
  const id = getSlideIdFromURL();
  if (!id) {
    console.error("ID não fornecido na URL");
    return;
  }

  const { data, error } = await supabaseClient
    .from("Slides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar slide:", error);
    return;
  }

  const slide = data;

  for (const key in slide) {
    console.log(key);
    const elementId = key
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const el = document.getElementById(elementId);
    if (el) {
      if (key.includes("week of")) {
        const date = new Date(slide[key]);

        const formatted = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        el.textContent = formatted;
      } else {
        el.textContent = slide[key];
      }
    }
  }

  if (slide["client name"] && slide["week of"]) {
    document.title = `${slide["client name"]} - Week of ${slide["week of"]}`;
  }

  loading.classList.add("hidden");
}

function getSlideIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

window.addEventListener("DOMContentLoaded", loadSlideFromSupabase);

const TRANSITION_DURATION = 0.8;
const PARALLAX_AMOUNT = 30;

class Slideshow {
  constructor(slider) {
    this.slider = slider;
    this.slides = Array.from(this.slider.querySelectorAll(".slide-wrapper"));
    this.current = 0;
    this.slidesTotal = this.slides.length;
    this.isAnimating = false;

    this.prevButton = document.querySelector(".overlay-prev");
    this.nextButton = document.querySelector(".overlay-next");

    this.dotsContainer = this.slider.querySelector(".dots-container");
    this.dots = [];

    for (let i = 0; i < this.slidesTotal; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === this.current) dot.classList.add("active");
      dot.addEventListener("click", () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }

    this.slides.forEach((slide) => slide.classList.remove("is-current"));
    this.slides[this.current].classList.add("is-current");

    this.updateNavigation();
  }

  navigate(direction) {
    if (this.isAnimating) return;

    const nextIndex = this.current + direction;

    // Não navega se fora dos limites
    if (nextIndex < 0 || nextIndex >= this.slidesTotal) return;

    this.isAnimating = true;
    const previous = this.current;
    this.current = nextIndex;

    this.updateDots();
    this.animate(previous, this.current, direction);
    this.updateNavigation();
  }

  goTo(index) {
    if (this.isAnimating || index === this.current) return;

    this.isAnimating = true;
    const previous = this.current;
    const direction = index > previous ? 1 : -1;
    this.current = index;

    this.updateDots();
    this.animate(previous, this.current, direction);
    this.updateNavigation();
  }

  updateDots() {
    this.dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === this.current);
    });
  }

  updateNavigation() {
    this.prevButton.disabled = this.current === 0;
    this.current === 0
      ? this.prevButton.classList.add("hidden")
      : this.prevButton.classList.remove("hidden");
    this.nextButton.disabled = this.current === this.slidesTotal - 1;
    this.current === this.slidesTotal - 1
      ? this.nextButton.classList.add("hidden")
      : this.nextButton.classList.remove("hidden");
  }

  animate(current, upcoming, direction) {
    const currentSlide = this.slides[current];
    const upcomingSlide = this.slides[upcoming];

    gsap
      .timeline({
        defaults: { duration: TRANSITION_DURATION, ease: "power4.inOut" },
        onStart: () => {
          upcomingSlide.classList.add("is-current");
          gsap.set(upcomingSlide, {
            zIndex: 1,
            xPercent: direction * 100,
          });
        },
        onComplete: () => {
          currentSlide.classList.remove("is-current");
          gsap.set(currentSlide, { xPercent: 0, zIndex: "auto" });
          gsap.set(upcomingSlide, { xPercent: 0, zIndex: "auto" });
          this.isAnimating = false;
        },
      })
      .to(currentSlide, { xPercent: -direction * 100 })
      .to(upcomingSlide, { xPercent: 0 }, "<");
  }
}

const slider = document.querySelector(".slider");
const slideshow = new Slideshow(slider);

document
  .querySelector(".overlay-prev")
  .addEventListener("click", () => slideshow.navigate(-1));
document
  .querySelector(".overlay-next")
  .addEventListener("click", () => slideshow.navigate(1));
