interface StarIconProps {
  className?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

export const StarIcon = ({
  className = "",
  alt = "Star Rating",
  width = 14,
  height = 12,
}: StarIconProps) => {
  return (
    <img
      src="/images/star-icon.svg"
      alt={alt}
      className={`star-icon ${className}`}
      style={{ width, height }}
    />
  );
};
