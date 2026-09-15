export const name = 'user-profile'
export const inject = ['tools']

export function apply(ctx: any) {
  ctx.tools.register({
    name: 'greet',
    description: 'Greet someone by name.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name to greet'
        }
      },
      required: ['name']
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }]
    },
    async execute(args: any) {
      return `Hello, ${args.name}!`
    }
  })
}
