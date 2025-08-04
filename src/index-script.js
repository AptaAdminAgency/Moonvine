const supabaseUrl = "https://lzjitoimrnfzwwnpktfi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aml0b2ltcm5mend3bnBrdGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTI1ODksImV4cCI6MjA2OTY2ODU4OX0.XrOAZluF1zrBBqr4GqvvyvBAU7pRmdF8mqbE7YK89Ho";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loadAllSlides() {
  const { data, error } = await supabaseClient
    .from("Slides")
    .select("*")
    .order("created_at", { ascending: false }); // opcional ordenar do mais recente

  if (error) {
    console.error("Erro ao buscar slides:", error);
    return;
  }

  const list = document.getElementById("slides-list");
  list.innerHTML = "";

  data.forEach((slide) => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    const slideUrl = `slides.html?id=${slide.id}`;
    link.href = slideUrl;
    link.textContent = slide["client name"] || "No client name";

    const week = document.createElement("small");
    week.textContent = slide["week of"] || "No week info";

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy link";
    copyBtn.style.marginTop = "0.5rem";
    copyBtn.style.padding = "4px 8px";
    copyBtn.style.fontSize = "0.85rem";
    copyBtn.style.cursor = "pointer";
    copyBtn.style.border = "none";
    copyBtn.style.borderRadius = "4px";
    copyBtn.style.background = "#ffba20";
    copyBtn.style.color = "#000";

    copyBtn.addEventListener("click", () => {
      navigator.clipboard
        .writeText(window.location.origin + "/" + slideUrl)
        .then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy link";
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    });

    li.appendChild(link);
    li.appendChild(week);
    li.appendChild(copyBtn);
    list.appendChild(li);
  });
}

window.addEventListener("DOMContentLoaded", loadAllSlides);
