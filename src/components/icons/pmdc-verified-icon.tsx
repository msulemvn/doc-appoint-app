interface PmdcVerifiedIconProps {
  className?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

export const PmdcVerifiedIcon = ({
  className = "",
  alt = "PMDC Verified",
  width = 12,
  height = 12,
}: PmdcVerifiedIconProps) => {
  return (
    <img
      src="/images/pmdc-verified-icon.svg"
      alt={alt}
      className={`pmdc-verified-icon ${className}`}
      style={{ width, height }}
    />
  );
};
