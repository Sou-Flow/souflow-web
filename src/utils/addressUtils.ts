export const encodeAddress = (
	street: string,
	ward: string,
	district: string,
	city: string,
): string => {
	return `${(street || "").trim()} || ${(ward || "").trim()} || ${(district || "").trim()} || ${(city || "").trim()}`;
};

export const decodeAddress = (
	fullAddressString: string | undefined | null,
	// biome-ignore lint/suspicious/noExplicitAny: skip
	locationData: any[],
) => {
	if (!fullAddressString)
		return { street: "", cityCode: "", districtCode: "", wardCode: "" };

	if (fullAddressString.includes(" || ")) {
		const parts = fullAddressString.split(" || ");
		const street = parts[0] || "";
		const wardName = parts[1] || "";
		const districtName = parts[2] || "";
		const cityName = parts[3] || "";

		let cityCode: string | number = "";
		let districtCode: string | number = "";
		let wardCode: string | number = wardName;

		if (locationData && locationData.length > 0) {
			const cityObj = locationData.find(
				// biome-ignore lint/suspicious/noExplicitAny: skip
				(c: any) => c.name === cityName || String(c.code) === String(cityName),
			);
			if (cityObj) {
				cityCode = cityObj.code;

				if (cityObj.districts) {
					const distObj = cityObj.districts.find(
						// biome-ignore lint/suspicious/noExplicitAny: skip
						(d: any) =>
							d === districtName ||
							d.name === districtName ||
							String(d.code) === String(districtName),
					);
					if (distObj) {
						districtCode = typeof distObj === "string" ? distObj : distObj.code;

						// Tìm ward
						if (distObj.wards) {
							const wObj = distObj.wards.find(
								// biome-ignore lint/suspicious/noExplicitAny: skip
								(w: any) =>
									w.name === wardName || String(w.code) === String(wardName),
							);
							if (wObj) {
								wardCode = wObj.code;
							}
						}
					}
				}
			}
		}

		return { street, cityCode, districtCode, wardCode };
	}

	// Trường hợp chuỗi địa chỉ cũ (chưa theo chuẩn " || ")
	return {
		street: fullAddressString,
		cityCode: "",
		districtCode: "",
		wardCode: "",
	};
};
