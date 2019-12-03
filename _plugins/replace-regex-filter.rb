module Jekyll
  module RegexFilter
    def replace_regex(input, pattern, value)
      regex = /#{pattern}/
      return input.gsub(regex, value)
    end
  end
end

Liquid::Template.register_filter(Jekyll::RegexFilter)
