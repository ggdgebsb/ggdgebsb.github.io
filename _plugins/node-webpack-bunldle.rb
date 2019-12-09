Jekyll::Hooks.register :site, :after_init do |site|
  system("npm run bundling-dev")
  site.config["builded"] = true
end

Jekyll::Hooks.register :site, :post_read do |site|
  if site.config["builded"]
    site.config["builded"] = false
  else
    system("npm run bundling-dev")
    site.config["builded"] = true
  end
end
