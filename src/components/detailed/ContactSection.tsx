"use client";
import Link from "next/link"
type Contact = {
  address?: string;
  phone?: string;
  workingDay?: string;
  email?: string;
};

export default function ContactSection({
  contact,
  mapSrc,
}: {
  contact?: Contact;
  mapSrc?: string;
}) {
  const phoneHref = contact?.phone
    ? `tel:${contact.phone.replace(/\s+/g, "")}`
    : undefined;

  return (
    <section className="w-full flex flex-col md:flex-row gap-6 mt-8">
      {/* Left: Contact Details */}
      <div className="md:w-3/5 w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Contact Details
        </h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-600">{contact?.address ?? "-"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Phone number:</span>{" "}
            {phoneHref ? (
              <Link href={phoneHref} className="text-blue-600 hover:underline">
                {contact?.phone}
              </Link>
            ) : (
              <span className="text-gray-600">-</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>{" "}
            {contact?.email ? (
              <Link
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline"
              >
                {contact.email}
              </Link>
            ) : (
              <span className="text-gray-600">-</span>
            )}
          </div>
          {contact?.workingDay && (
            <div>
              <span className="font-medium text-gray-700">Working Day:</span>{" "}
              <span className="text-gray-600">{contact.workingDay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Map */}
      <div className="md:w-2/5 w-full h-[300px] md:h-auto">
        {mapSrc ? (
          <iframe
            title="map"
            src={mapSrc}
            width="100%"
            height="100%"
            className="border-0 h-full w-full rounded-xl shadow-sm"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="h-full w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">No map available</p>
          </div>
        )}
      </div>
    </section>
  );
}