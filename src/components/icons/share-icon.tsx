interface ShareIconProps {
  className?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

export const ShareIcon = ({
  className = "",
  alt = "Share",
  width = 12,
  height = 14,
}: ShareIconProps) => {
  return (
    <img
      src="/images/share-icon.svg"
      alt={alt}
      className={`share-icon ${className}`}
      style={{ width, height }}
    />
  );
};
