// vite.config.ts
import react from "file:///C:/Users/91767/BountyHub/projects/frontend/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__04f2ff200931b6a4de6cc9adcf77c622/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig, loadEnv } from "file:///C:/Users/91767/BountyHub/projects/frontend/node_modules/.pnpm/vite@5.4.20_@types+node@18.19.130/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///C:/Users/91767/BountyHub/projects/frontend/node_modules/.pnpm/vite-plugin-node-polyfills@_f3083b590fbacaadc4f9112154fad095/node_modules/vite-plugin-node-polyfills/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\91767\\BountyHub\\projects\\frontend";
function extractGeminiText(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  return candidates.flatMap((candidate) => candidate?.content?.parts ?? []).map((part) => part?.text ?? "").join("\n").trim();
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const geminiApiKey = env.GEMINI_API_KEY;
  return {
    server: {
      proxy: {
        "/api/gemini": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/gemini/, "/v1beta")
        }
      }
    },
    plugins: [
      react(),
      {
        name: "project-ai-dev-api",
        configureServer(server) {
          server.middlewares.use("/api/project-ai", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }
            if (!geminiApiKey) {
              res.statusCode = 503;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing GEMINI_API_KEY in frontend .env.local" }));
              return;
            }
            let bodyText = "";
            req.on("data", (chunk) => {
              bodyText += chunk.toString();
            });
            req.on("end", async () => {
              try {
                const body = bodyText ? JSON.parse(bodyText) : {};
                const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
                const messages = Array.isArray(body.messages) ? body.messages : [];
                const activeTab = typeof body.activeTab === "string" ? body.activeTab : "/";
                const walletConnected = Boolean(body.walletConnected);
                const network = typeof body.network === "string" ? body.network : "Algorand Testnet";
                if (!prompt) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Prompt is required" }));
                  return;
                }
                const conversation = messages.map((message) => {
                  const role = message?.role === "model" ? "Assistant" : "User";
                  const text = Array.isArray(message?.parts) ? message.parts[0]?.text : "";
                  return text ? `${role}: ${text}` : "";
                }).filter(Boolean).join("\n\n");
                const fullPrompt = `
You are the EscrowBar Assistant Bot. You help users navigate a decentralized freelance bounty platform built on Algorand. Keep responses concise, clear, and very helpful.

Current context:
- Active tab: ${activeTab}
- Wallet connected: ${walletConnected ? "yes" : "no"}
- Network: ${network}

Conversation:
${conversation || "No prior messages."}

Latest user question:
${prompt}
`.trim();
                const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": geminiApiKey
                  },
                  body: JSON.stringify({
                    contents: [
                      {
                        role: "user",
                        parts: [{ text: fullPrompt }]
                      }
                    ],
                    generationConfig: {
                      temperature: 0.4,
                      maxOutputTokens: 512
                    }
                  })
                });
                const payload = await response.json();
                if (!response.ok) {
                  res.statusCode = response.status;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: payload?.error?.message || "Gemini API failed" }));
                  return;
                }
                const reply = extractGeminiText(payload);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ reply: reply || "No response generated." }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected API error" }));
              }
            });
          });
        }
      },
      nodePolyfills({
        globals: {
          Buffer: true
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFw5MTc2N1xcXFxCb3VudHlIdWJcXFxccHJvamVjdHNcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXDkxNzY3XFxcXEJvdW50eUh1YlxcXFxwcm9qZWN0c1xcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvOTE3NjcvQm91bnR5SHViL3Byb2plY3RzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmZ1bmN0aW9uIGV4dHJhY3RHZW1pbmlUZXh0KHBheWxvYWQ6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBBcnJheS5pc0FycmF5KHBheWxvYWQ/LmNhbmRpZGF0ZXMpID8gcGF5bG9hZC5jYW5kaWRhdGVzIDogW11cbiAgcmV0dXJuIGNhbmRpZGF0ZXNcbiAgICAuZmxhdE1hcCgoY2FuZGlkYXRlOiBhbnkpID0+IGNhbmRpZGF0ZT8uY29udGVudD8ucGFydHMgPz8gW10pXG4gICAgLm1hcCgocGFydDogYW55KSA9PiBwYXJ0Py50ZXh0ID8/ICcnKVxuICAgIC5qb2luKCdcXG4nKVxuICAgIC50cmltKClcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgY29uc3QgZ2VtaW5pQXBpS2V5ID0gZW52LkdFTUlOSV9BUElfS0VZXG5cbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpL2dlbWluaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbScsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChyZXF1ZXN0UGF0aCkgPT4gcmVxdWVzdFBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2dlbWluaS8sICcvdjFiZXRhJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3Byb2plY3QtYWktZGV2LWFwaScsXG4gICAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3Byb2plY3QtYWknLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDVcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFnZW1pbmlBcGlLZXkpIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDNcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNaXNzaW5nIEdFTUlOSV9BUElfS0VZIGluIGZyb250ZW5kIC5lbnYubG9jYWwnIH0pKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGJvZHlUZXh0ID0gJydcbiAgICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICBib2R5VGV4dCArPSBjaHVuay50b1N0cmluZygpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0gYm9keVRleHQgPyBKU09OLnBhcnNlKGJvZHlUZXh0KSA6IHt9XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbXB0ID0gdHlwZW9mIGJvZHkucHJvbXB0ID09PSAnc3RyaW5nJyA/IGJvZHkucHJvbXB0LnRyaW0oKSA6ICcnXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBBcnJheS5pc0FycmF5KGJvZHkubWVzc2FnZXMpID8gYm9keS5tZXNzYWdlcyA6IFtdXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlVGFiID0gdHlwZW9mIGJvZHkuYWN0aXZlVGFiID09PSAnc3RyaW5nJyA/IGJvZHkuYWN0aXZlVGFiIDogJy8nXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0Q29ubmVjdGVkID0gQm9vbGVhbihib2R5LndhbGxldENvbm5lY3RlZClcbiAgICAgICAgICAgICAgICBjb25zdCBuZXR3b3JrID0gdHlwZW9mIGJvZHkubmV0d29yayA9PT0gJ3N0cmluZycgPyBib2R5Lm5ldHdvcmsgOiAnQWxnb3JhbmQgVGVzdG5ldCdcblxuICAgICAgICAgICAgICAgIGlmICghcHJvbXB0KSB7XG4gICAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMFxuICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUHJvbXB0IGlzIHJlcXVpcmVkJyB9KSlcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnNhdGlvbiA9IG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAubWFwKChtZXNzYWdlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9sZSA9IG1lc3NhZ2U/LnJvbGUgPT09ICdtb2RlbCcgPyAnQXNzaXN0YW50JyA6ICdVc2VyJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gQXJyYXkuaXNBcnJheShtZXNzYWdlPy5wYXJ0cykgPyBtZXNzYWdlLnBhcnRzWzBdPy50ZXh0IDogJydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgPyBgJHtyb2xlfTogJHt0ZXh0fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICAgICAgICAgIC5qb2luKCdcXG5cXG4nKVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbFByb21wdCA9IGBcbllvdSBhcmUgdGhlIEVzY3Jvd0JhciBBc3Npc3RhbnQgQm90LiBZb3UgaGVscCB1c2VycyBuYXZpZ2F0ZSBhIGRlY2VudHJhbGl6ZWQgZnJlZWxhbmNlIGJvdW50eSBwbGF0Zm9ybSBidWlsdCBvbiBBbGdvcmFuZC4gS2VlcCByZXNwb25zZXMgY29uY2lzZSwgY2xlYXIsIGFuZCB2ZXJ5IGhlbHBmdWwuXG5cbkN1cnJlbnQgY29udGV4dDpcbi0gQWN0aXZlIHRhYjogJHthY3RpdmVUYWJ9XG4tIFdhbGxldCBjb25uZWN0ZWQ6ICR7d2FsbGV0Q29ubmVjdGVkID8gJ3llcycgOiAnbm8nfVxuLSBOZXR3b3JrOiAke25ldHdvcmt9XG5cbkNvbnZlcnNhdGlvbjpcbiR7Y29udmVyc2F0aW9uIHx8ICdObyBwcmlvciBtZXNzYWdlcy4nfVxuXG5MYXRlc3QgdXNlciBxdWVzdGlvbjpcbiR7cHJvbXB0fVxuYC50cmltKClcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLTIuNS1mbGFzaDpnZW5lcmF0ZUNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ3gtZ29vZy1hcGkta2V5JzogZ2VtaW5pQXBpS2V5LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW3sgdGV4dDogZnVsbFByb21wdCB9XSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNCxcbiAgICAgICAgICAgICAgICAgICAgICBtYXhPdXRwdXRUb2tlbnM6IDUxMixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXNcbiAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogcGF5bG9hZD8uZXJyb3I/Lm1lc3NhZ2UgfHwgJ0dlbWluaSBBUEkgZmFpbGVkJyB9KSlcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGx5ID0gZXh0cmFjdEdlbWluaVRleHQocGF5bG9hZClcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMFxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgcmVwbHk6IHJlcGx5IHx8ICdObyByZXNwb25zZSBnZW5lcmF0ZWQuJyB9KSlcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMFxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1VuZXhwZWN0ZWQgQVBJIGVycm9yJyB9KSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgQnVmZmVyOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgfSxcbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULE9BQU8sV0FBVztBQUM5VSxTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsU0FBUyxrQkFBa0IsU0FBc0I7QUFDL0MsUUFBTSxhQUFhLE1BQU0sUUFBUSxTQUFTLFVBQVUsSUFBSSxRQUFRLGFBQWEsQ0FBQztBQUM5RSxTQUFPLFdBQ0osUUFBUSxDQUFDLGNBQW1CLFdBQVcsU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUMzRCxJQUFJLENBQUMsU0FBYyxNQUFNLFFBQVEsRUFBRSxFQUNuQyxLQUFLLElBQUksRUFDVCxLQUFLO0FBQ1Y7QUFHQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxlQUFlLElBQUk7QUFFekIsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsZUFBZTtBQUFBLFVBQ2Is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
