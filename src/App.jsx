import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { ArrowRightCircleIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Özel siyah marker tanımı
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [32, 45],
    iconAnchor: [16, 45],
    popupAnchor: [0, -40],
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function ChangeView({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.setView(coords, 13);
    }, [coords, map]);
    return null;
}

export default function IPTrackerApp() {
    const [ip, setIp] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchIPInfo = async (query) => {
        setLoading(true);
        setError("");
        try {
            const url = query
                ? `https://ipwho.is/${query}`
                : `https://ipwho.is/`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.error) {
                setError("Geçersiz IP adresi veya alan adı.");
                setData(null);
            } else {
                setData(json);
            }
        } catch (err) {
            console.error("IP fetch failed:", err);
            setError("Veri alınamadı. Lütfen tekrar deneyin.");
            setData(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIPInfo("");
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!ip.trim()) return;
        fetchIPInfo(ip.trim());
    };

    const coords =
        data?.latitude && data?.longitude
            ? [parseFloat(data.latitude), parseFloat(data.longitude)]
            : null;

    return (
        <div className="min-h-screen  flex flex-col items-center bg-white">
            {/* Header */}
            <div className="w-full  relative bg-[url('/ip-address-background.png')] bg-center  bg-cover py-10 px-6  pb-32 rounded-b-3xl text-white text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                    IP Address Tracker
                </h1>

                <form
                    onSubmit={handleSearch}
                    className="flex max-w-xl mx-auto w-full bg-white rounded-lg overflow-hidden"
                >
                    <input
                        type="text"
                        placeholder="Search for any IP address or domain"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        className="flex-grow p-4 text-gray-900 text-sm sm:text-base focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-black px-5 flex items-center justify-center hover:bg-gray-800 transition"
                    >
                        <ArrowRightCircleIcon className="text-white w-6 h-6" />
                    </button>
                </form>
                {/* Info Card */}
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {data && (
                    <div className="flex justify-center ">
                        <div className="mt-15 z-20 absolute bg-white rounded-xl shadow-xl p-6 grid  grid-cols-1 sm:grid-cols-4 gap-y-6 sm:gap-y-1 text-sm  text-center  max-w-5xl w-full mx-6">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-xs text-gray-500 uppercase mb-1">
                                    IP Address
                                </h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {data.ip || "N/A"}
                                </p>
                            </div>
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-xs text-gray-500 uppercase mb-1">
                                    Location
                                </h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {data.country || "N/A"}, {data.region || ""}{" "}
                                    {data.postal || ""}
                                </p>
                            </div>
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-xs text-gray-500 uppercase mb-1">
                                    Timezone
                                </h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {data.timezone.utc || "N/A"}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs text-gray-500 uppercase mb-1">
                                    ISP
                                </h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {data.connection.isp || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Map */}
            {coords && (
                <div className="w-screen h-[75vh] mt-10 z-10 ">
                    <MapContainer
                        center={coords}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <ChangeView coords={coords} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={coords} icon={customIcon}>
                            <Popup>
                                {data.city || "Unknown"},{" "}
                                {data.country_name || ""}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}
        </div>
    );
}
