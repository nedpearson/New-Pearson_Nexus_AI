export function installInjectedScriptBlocker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const isBlockedScript = (src: string): boolean => {
    const lowerSrc = src.toLowerCase();
    return lowerSrc.includes('chmln') ||
           lowerSrc.includes('messo') ||
           lowerSrc.includes('chameleon') ||
           lowerSrc.includes('trychameleon');
  };

  console.log('[Script Blocker] Installing third-party script blocker...');

  const removeExistingBlockedScripts = () => {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const src = script.getAttribute('src');
      if (src && isBlockedScript(src)) {
        console.warn('[Script Blocker] Removing blocked third-party script:', src);
        script.remove();
      }
    });
  };

  removeExistingBlockedScripts();

  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function (tagName: string, options?: ElementCreationOptions): HTMLElement {
    const element = originalCreateElement(tagName, options);

    if (tagName.toLowerCase() === 'script') {
      const scriptElement = element as HTMLScriptElement;

      const originalSetAttribute = scriptElement.setAttribute.bind(scriptElement);
      scriptElement.setAttribute = function (name: string, value: string) {
        if (name.toLowerCase() === 'src' && isBlockedScript(value)) {
          console.warn('[Script Blocker] Blocked third-party script via setAttribute:', value);
          return;
        }
        originalSetAttribute(name, value);
      };

      Object.defineProperty(scriptElement, 'src', {
        get() {
          return this.getAttribute('src') || '';
        },
        set(value: string) {
          if (isBlockedScript(value)) {
            console.warn('[Script Blocker] Blocked third-party script via src setter:', value);
            return;
          }
          this.setAttribute('src', value);
        },
        configurable: true,
      });
    }

    return element;
  };

  const createAppendChildPatch = (originalAppendChild: any) => {
    return function <T extends Node>(this: Node, newChild: T): T {
      if (newChild.nodeName === 'SCRIPT') {
        const scriptElement = newChild as unknown as HTMLScriptElement;
        const src = scriptElement.src || scriptElement.getAttribute('src');
        if (src && isBlockedScript(src)) {
          console.warn('[Script Blocker] Blocked third-party script via appendChild:', src);
          return newChild;
        }
      }
      return originalAppendChild.call(this, newChild);
    };
  };

  const originalNodeAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = createAppendChildPatch(originalNodeAppendChild) as any;

  if (Element.prototype.appendChild && Element.prototype.appendChild !== Node.prototype.appendChild) {
    const originalElementAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = createAppendChildPatch(originalElementAppendChild) as any;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const scriptElement = node as HTMLScriptElement;
          const src = scriptElement.src || scriptElement.getAttribute('src');
          if (src && isBlockedScript(src)) {
            console.warn('[Script Blocker] Removing blocked third-party script detected by MutationObserver:', src);
            scriptElement.remove();
          }
        }
      });
    });
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  window.addEventListener('error', (event: ErrorEvent) => {
    const message = event.message || '';
    const filename = event.filename || '';
    const stack = event.error?.stack || '';
    const combined = `${message} ${filename} ${stack}`.toLowerCase();

    const isBlockedError =
      combined.includes('chmln') ||
      combined.includes('messo') ||
      combined.includes('chameleon') ||
      combined.includes('trychameleon');

    if (isBlockedError) {
      console.warn('[Script Blocker] Suppressed third-party script error:', message);
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    let shouldSuppress = false;

    if (reason instanceof Error) {
      const combined = `${reason.message || ''} ${reason.stack || ''}`.toLowerCase();
      shouldSuppress =
        combined.includes('chmln') ||
        combined.includes('messo') ||
        combined.includes('chameleon') ||
        combined.includes('trychameleon');
    } else if (typeof reason === 'string') {
      const lower = reason.toLowerCase();
      shouldSuppress =
        lower.includes('chmln') ||
        lower.includes('messo') ||
        lower.includes('chameleon') ||
        lower.includes('trychameleon');
    }

    if (shouldSuppress) {
      console.warn('[Script Blocker] Suppressed third-party script promise rejection:', reason);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  console.log('[Script Blocker] Third-party script blocker installed successfully');
}
