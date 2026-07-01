const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

// THAY TOKEN CỦA BẠN VÀO ĐÂY NẾU CHẠY TRỰC TIẾP, HOẶC TRUYỀN QUA COMMAND LINE
const GHN_TOKEN = process.argv[2] || "YOUR_GHN_TOKEN_HERE";

if (GHN_TOKEN === "YOUR_GHN_TOKEN_HERE") {
	console.error("❌ Lỗi: Vui lòng cung cấp GHN Token!");
	console.error(
		"Cách chạy: node src/scripts/fetch-ghn-locations.js <GHN_TOKEN>",
	);
	process.exit(1);
}

const BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const HEADERS = {
	token: GHN_TOKEN,
	"Content-Type": "application/json",
};

function fetchGHN(endpoint, method = "GET", body = null) {
	return new Promise((resolve, reject) => {
		const url = new URL(BASE_URL + endpoint);
		const options = {
			method: method,
			headers: HEADERS,
		};

		const req = https.request(url, options, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				try {
					const parsed = JSON.parse(data);
					if (parsed.code === 200) {
						resolve(parsed.data);
					} else {
						reject(`GHN API Error (${endpoint}): ${parsed.message}`);
					}
				} catch (e) {
					reject(e);
				}
			});
		});

		req.on("error", reject);

		if (body) {
			req.write(JSON.stringify(body));
		}
		req.end();
	});
}

async function buildLocationTree() {
	console.log("⏳ Bắt đầu tải dữ liệu từ GHN...");

	try {
		// 1. Fetch Provinces
		console.log("1. Đang tải Tỉnh/Thành phố...");
		const provinces = await fetchGHN("/province");

		const finalData = [];

		for (const prov of provinces) {
			const provinceNode = {
				id: prov.ProvinceID,
				name: prov.ProvinceName,
				code: prov.Code,
				districts: [],
			};

			// 2. Fetch Districts for each Province
			console.log(`2. Đang tải Quận/Huyện cho: ${prov.ProvinceName}...`);
			const districts = await fetchGHN("/district", "POST", {
				province_id: prov.ProvinceID,
			});

			for (const dist of districts) {
				const districtNode = {
					id: dist.DistrictID,
					name: dist.DistrictName,
					code: dist.Code,
					wards: [],
				};

				// 3. Fetch Wards for each District
				const wards = await fetchGHN(`/ward?district_id=${dist.DistrictID}`);
				if (wards) {
					for (const ward of wards) {
						districtNode.wards.push({
							code: ward.WardCode,
							name: ward.WardName,
						});
					}
				}

				provinceNode.districts.push(districtNode);
			}

			finalData.push(provinceNode);
		}

		// Lưu ra file
		const targetDir = path.join(__dirname, "..", "lib", "data");
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}
		const outputPath = path.join(targetDir, "ghn-locations.json");

		fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
		console.log(
			`\n✅ THÀNH CÔNG! Đã lưu toàn bộ dữ liệu vào: src/lib/data/ghn-locations.json`,
		);
	} catch (error) {
		console.error("\n❌ CÓ LỖI XẢY RA:", error);
	}
}

buildLocationTree();
