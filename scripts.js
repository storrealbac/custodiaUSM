document.addEventListener('alpine:init', () => {
  Alpine.data("formFilled", () => ({
    disabled: true,

    init() {

      const inputs = [...document.querySelectorAll("input[name]")];
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          console.log("->", this.disabled);
          this.disabled = !inputs.every((input) => input.value.trim() !== "");
        });
      });

    }
  }));


})