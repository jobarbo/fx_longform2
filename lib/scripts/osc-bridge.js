/**
 * OSC → WebSocket bridge for MIDI clock (TouchDesigner → browser sketch)
 *
 * TouchDesigner — OSC Out (multicast UDP), example config:
 *   Protocol: Multi-Cast Messaging (UDP)
 *   Network Address: 239.255.0.1
 *   Network Port: 1337
 *   Local Address: 10.0.0.114  (your machine's LAN IP — set OSC_LOCAL_ADDRESS in .env)
 *   OSC Address Scope: *  (all paths accepted)
 *
 * Unicast fallback: omit OSC_MULTICAST and set OSC_PORT (default was 9000).
 *
 * MIDI bytes in OSC args (any address path, e.g. /midi):
 *   248 clock | 250 start | 251 continue | 252 stop | 242 song position
 *
 * Usage:
 *   npm run osc:bridge
 *   node lib/scripts/osc-bridge.js --osc-port 1337 --multicast 239.255.0.1 --local-address 10.0.0.114
 */

require("dotenv").config();

const osc = require("osc");
const WebSocket = require("ws");

const MIDI_TYPES = {
	248: "clock",
	250: "start",
	251: "continue",
	252: "stop",
	242: "songPosition",
};

function parseArgs(argv) {
	const opts = {
		oscPort: Number(process.env.OSC_PORT) || 1337,
		wsPort: Number(process.env.OSC_WS_PORT) || 3302,
		host: process.env.OSC_HOST || "0.0.0.0",
		multicast: process.env.OSC_MULTICAST || "239.255.0.1",
		localAddress: process.env.OSC_LOCAL_ADDRESS || "",
	};

	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--osc-port" && argv[i + 1]) opts.oscPort = Number(argv[++i]);
		else if (arg === "--ws-port" && argv[i + 1]) opts.wsPort = Number(argv[++i]);
		else if (arg === "--host" && argv[i + 1]) opts.host = argv[++i];
		else if (arg === "--multicast" && argv[i + 1]) opts.multicast = argv[++i];
		else if (arg === "--no-multicast") opts.multicast = "";
		else if (arg === "--local-address" && argv[i + 1]) opts.localAddress = argv[++i];
	}

	return opts;
}

function oscArgToNumber(arg) {
	if (arg == null) return null;
	if (typeof arg === "number" && Number.isFinite(arg)) return Math.round(arg);
	if (typeof arg.value === "number") return Math.round(arg.value);
	if (typeof arg === "string" && arg !== "") {
		const n = Number(arg);
		return Number.isFinite(n) ? Math.round(n) : null;
	}
	return null;
}

function extractMidiStatus(args) {
	if (!Array.isArray(args)) return null;
	for (const arg of args) {
		const n = oscArgToNumber(arg);
		if (n != null && n >= 0 && n <= 255) return n;
	}
	return null;
}

function classifyMidi(status) {
	if (status == null) return "unknown";
	return MIDI_TYPES[status] || "unknown";
}

function normalizeOscMessage(oscMsg) {
	const address = oscMsg.address || "";
	const rawArgs = oscMsg.args || [];
	const args = rawArgs.map((arg) => oscArgToNumber(arg)).filter((n) => n != null);
	const status = extractMidiStatus(rawArgs);
	const type = classifyMidi(status);

	return {
		address,
		args,
		status,
		type,
		ts: Date.now(),
	};
}

function main() {
	const {oscPort, wsPort, host, multicast, localAddress} = parseArgs(process.argv);

	const wss = new WebSocket.Server({host, port: wsPort});
	const clients = new Set();

	wss.on("connection", (ws) => {
		clients.add(ws);
		console.log(`[osc-bridge] WebSocket client connected (${clients.size} total)`);
		ws.on("close", () => {
			clients.delete(ws);
			console.log(`[osc-bridge] WebSocket client disconnected (${clients.size} total)`);
		});
	});

	const bindAddress = host;
	const udpOptions = {
		localAddress: bindAddress,
		localPort: oscPort,
		metadata: true,
	};

	if (multicast) {
		udpOptions.multicastMembership = localAddress
			? {address: multicast, interface: localAddress}
			: multicast;
	}

	const udpPort = new osc.UDPPort(udpOptions);

	udpPort.on("ready", () => {
		if (multicast) {
			console.log(`[osc-bridge] OSC multicast ${multicast}:${oscPort} on ${bindAddress}${localAddress ? ` (iface ${localAddress})` : ""}`);
		} else {
			console.log(`[osc-bridge] OSC UDP listening on ${bindAddress}:${oscPort}`);
		}
		console.log(`[osc-bridge] WebSocket server on ws://${host === "0.0.0.0" ? "localhost" : host}:${wsPort}`);
	});

	let clockLogCounter = 0;
	udpPort.on("message", (oscMsg) => {
		const payload = normalizeOscMessage(oscMsg);
		const json = JSON.stringify(payload);

		if (payload.type !== "clock") {
			console.log(`[osc-bridge] OSC ${payload.address} ${payload.type} [${payload.args.join(", ")}] → ${clients.size} client(s)`);
		} else if (++clockLogCounter % 48 === 1) {
			console.log(`[osc-bridge] OSC ${payload.address} clock (tick #${clockLogCounter}) → ${clients.size} client(s)`);
		}

		for (const client of clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(json);
			}
		}
	});

	udpPort.on("error", (err) => {
		console.error("[osc-bridge] OSC error:", err.message);
	});

	udpPort.open();

	process.on("SIGINT", () => {
		console.log("\n[osc-bridge] shutting down");
		udpPort.close();
		wss.close();
		process.exit(0);
	});
}

main();
