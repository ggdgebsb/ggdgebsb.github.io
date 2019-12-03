import { Dictionary, Configuration } from './types';
import { AxiosResponse } from 'axios';

namespace Site {
  export class Post {
    public id: string;
    public title: string;
    public description: string;
    public date: string;
    public tags: string[];
    public slug: string;
    public url: string;
    public excerpt: string;
    public content: string;
    public previous: Post | null;
    public next: Post | null;
  
    public constructor(post: Configuration<Post>) {
      this.id = post.id;
      this.title = post.title;
      this.description = post.description;
      this.date = post.date;
      this.tags = post.tags;
      this.slug = post.slug;
      this.url = post.url;
      this.excerpt = post.excerpt;
      this.content = post.content;
      this.previous = post.previous || null;
      this.next = post.next || null;
    }
  }
  
  export class Tag {
    public name: string;
    public slug: string;
  
    public constructor(tag: Configuration<Tag>) {
      this.name = tag.name;
      this.slug = tag.slug;
    }
  }
  
  abstract class Collector<T> {
    protected list: T[];
    protected dictionary: Dictionary<number>;

    constructor(
      private readonly resourceEndpoint: string
    ) {
      this.list = [];
      this.dictionary = {};
    }

    getList(): T[] {
      return this.list;
    }
    
    getItem(index: number): T {
      return this.list[index];
    }
  
    public collect(): Promise<Collector<T>> {
      type Resolve = (value: Collector<T>) => void;
      type Reject = (reason: Error) => void;
  
      const resolver = (resolve: Resolve, reject: Reject) => {
        this.loadResource()
          .then(resolve)
          .catch(reject);
      };
  
      return new Promise<Collector<T>>(resolver);
    }
  
    private loadResource(): Promise<Collector<T>> {
      type Resolve = (collector: Collector<T>) => void;
      type Reject = (reason: Error) => void;
  
      const resolver = (resolve: Resolve, reject: Reject) => {
        this.requestResource()
          .then((collection: any[]) => {
            resolve(this.parseResource(collection));
          })
          .catch(reject);
      };
  
      return new Promise<Collector<T>>(resolver);
    }
  
    private requestResource(): Promise<any[]> {
      type Resolve = (collection: any[]) => void;
      type Reject = (reason: Error) => void;
      
      const resolver = (resolve: Resolve, reject: Reject) => {
        axios.get<any[]>(this.resourceEndpoint)
          .then((response: AxiosResponse<any[]>) => {
            resolve(response.data);
          })
          .catch(reject);
      };
  
      return new Promise<any[]>(resolver);
    }
  
    protected abstract parseResource(collection: any[]): Collector<T>;

    public searchByIndex(key: string): number {
      return key in this.dictionary ? this.dictionary[key] : -1;
    }

    public search(key: string): T | null {
      const index: number = this.searchByIndex(key);
      return index !== -1 ? this.getItem(index) : null;
    }

    public find(isThis: (item: T) => boolean): T[] {
      let result: T[] = [];

      for (const item of this.list) {
        if (isThis(item)) {
          result.push(item)
        }
      }

      return result;
    }
  }
  
  export class PostCollector extends Collector<Post> {
  
    constructor() {
      super('/assets/json/posts.json');
    }
  
    public collect(): Promise<PostCollector> {
      return super.collect() as Promise<PostCollector>;
    }
  
    protected parseResource(collection: any[]): PostCollector {
      for (const item of collection) {
        const post = new Post({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          tags: item.tags,
          slug: item.slug,
          url: item.url,
          content: item.content,
          excerpt: item.excerpt,
          previous: null,
          next: null,
        });
  
        const length = this.list.push(post);
        const index = length - 1;
        this.dictionary[post.id] = index;
        this.dictionary[post.title] = index;
        this.dictionary[post.slug] = index;
      }
  
      for (const item of collection) {
        const index = this.dictionary[item.id];
        const post = this.list[index];
        
        if (item.previous in this.dictionary) {
          const previousIndex = this.dictionary[item.previous];
          post.previous = this.list[previousIndex];
        }
        
        if (item.next in this.dictionary) {
          const nextIndex = this.dictionary[item.next];
          post.next = this.list[nextIndex];
        }
      }
  
      return this;
    }
  }
  
  export class TagCollector extends Collector<Tag> {  
    constructor() {
      super('/assets/json/tags.json');
    }
  
    public collect(): Promise<TagCollector> {
      return super.collect()  as Promise<TagCollector>;
    }
  
    protected parseResource(collection: any[]): TagCollector {
      for (const item of collection) {
        const tag = new Tag({
          name: item.name,
          slug: item.slug,
        });
  
        const length = this.list.push(tag);
        const index = length - 1;
        this.dictionary[tag.name] = index;
        this.dictionary[tag.slug] = index;
      }
  
      return this;
    }
  }
}

declare global {
  interface Window { Site: typeof Site; }
}

export default window.Site = Site;;
