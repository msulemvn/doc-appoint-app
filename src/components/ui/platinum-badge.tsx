interface PlatinumBadgeProps {
  className?: string;
  alt?: string;
}

export const PlatinumBadge = ({
  className = "",
  alt = "Platinum Doctor",
}: PlatinumBadgeProps) => {
  return (
    <img
      src="/images/platinum-badge.svg"
      alt={alt}
      className={`platinum-doc-img ${className}`}
      style={{ height: "34px", width: "195px" }}
    />
  );
};
