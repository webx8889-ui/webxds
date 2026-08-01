document.addEventListener("DOMContentLoaded", function () {
    function resetProjectForm(form) {
        form.reset();
        form.querySelectorAll(".cta-project-error, .cta-project-status").forEach(function (item) {
            item.textContent = "";
        });
        form.querySelectorAll(".cta-project-service-option.is-selected").forEach(function (item) {
            item.classList.remove("is-selected");
        });
        const steps = Array.from(form.querySelectorAll(".cta-project-step"));
        steps.forEach(function (step, index) {
            step.classList.toggle("is-active", index === 0);
        });
        const budgetRange = form.querySelector('input[name="budgetRange"]');
        if (budgetRange) {
            budgetRange.value = budgetRange.defaultValue || "100000";
            budgetRange.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function closeProjectForm(form) {
        const section = form.closest(".cta-banner-section");
        if (!section) return;
        resetProjectForm(form);
        section.classList.remove("is-form-open");
        const trigger = section.querySelector(".cta-banner-button");
        if (trigger) window.setTimeout(function () {
            trigger.focus({ preventScroll: true });
        }, 120);
    }

    function ensureCancelButton(form) {
        if (form.querySelector(".cta-project-close")) return;
        const close = document.createElement("button");
        close.type = "button";
        close.className = "cta-project-close";
        close.setAttribute("aria-label", "Close start your project form");
        close.innerHTML = "&times;";
        form.insertBefore(close, form.firstChild);
    }

    function sanitizePhoneValue(value) {
        const text = String(value || "").trim();
        const hasCountryCode = text.charAt(0) === "+";
        const maxDigits = hasCountryCode ? 13 : 10;
        const digits = text.replace(/\D/g, "").slice(0, maxDigits);
        return hasCountryCode ? "+" + digits : digits;
    }

    function attachPhoneInputRules(form) {
        form.querySelectorAll('input[name="phone"]').forEach(function (field) {
            if (field.dataset.phoneInputRulesReady === "true") return;
            field.dataset.phoneInputRulesReady = "true";
            field.setAttribute("inputmode", "tel");
            field.setAttribute("maxlength", "14");

            field.addEventListener("beforeinput", function (event) {
                if (!event.data || event.inputType.indexOf("delete") === 0) return;
                const isDigit = /^\d+$/.test(event.data);
                const isLeadingPlus = event.data === "+" && field.selectionStart === 0 && field.value.indexOf("+") === -1;
                if (!isDigit && !isLeadingPlus) event.preventDefault();
            });

            field.addEventListener("input", function () {
                const cleanValue = sanitizePhoneValue(field.value);
                if (field.value !== cleanValue) field.value = cleanValue;
            });

            field.addEventListener("paste", function (event) {
                event.preventDefault();
                const pasted = (event.clipboardData || window.clipboardData).getData("text");
                field.value = sanitizePhoneValue(pasted);
                field.dispatchEvent(new Event("input", { bubbles: true }));
            });
        });
    }

    function validatePhoneValue(value) {
        const text = String(value || "").trim();
        if (!/^\+?\d*$/.test(text)) return { ok: false, msg: "Please enter numbers only for the phone number." };
        const digits = text.replace(/\D/g, "");
        if (text.startsWith("+")) {
            const countryCodeLength = digits.length - 10;
            if (countryCodeLength < 1 || countryCodeLength > 3) {
                return { ok: false, msg: "Enter country code and a 10-digit mobile number (e.g. +919876543210)." };
            }
            return { ok: true };
        }
        if (digits.length !== 10) return { ok: false, msg: "Please enter exactly 10 digits for the mobile number." };
        return { ok: true };
    }

    function attachForm(form) {
        if (!form || form.dataset.phoneOverrideReady === "true") return;
        form.dataset.phoneOverrideReady = "true";
        ensureCancelButton(form);
        attachPhoneInputRules(form);
        form.addEventListener('click', function (e) {
            const close = e.target.closest('.cta-project-close');
            if (close) {
                e.preventDefault();
                e.stopPropagation();
                closeProjectForm(form);
                return;
            }
            const btn = e.target.closest('[data-next]');
            if (!btn) return;
            const steps = Array.from(form.querySelectorAll('.cta-project-step'));
            const currentIndex = steps.findIndex(function (s) { return s.classList.contains('is-active'); });
            if (currentIndex === -1) return;
            const currentStep = steps[currentIndex];
            const field = currentStep.querySelector('input[name="phone"]');
            if (!field) return;
            const res = validatePhoneValue(field.value || '');
            if (!res.ok) {
                e.preventDefault();
                e.stopPropagation();
                const err = currentStep.querySelector('.cta-project-error');
                if (err) err.textContent = res.msg;
                field.focus({ preventScroll: true });
            } else {
                const err = currentStep.querySelector('.cta-project-error');
                if (err) err.textContent = '';
            }
        }, true);
    }

    // Attach to any existing forms and watch for dynamic forms
    document.querySelectorAll('.cta-project-form').forEach(attachForm);
    const mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            m.addedNodes.forEach(function (n) {
                if (n.nodeType !== 1) return;
                if (n.matches && n.matches('.cta-project-form')) attachForm(n);
                else if (n.querySelectorAll) n.querySelectorAll('.cta-project-form').forEach(attachForm);
            });
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
});
