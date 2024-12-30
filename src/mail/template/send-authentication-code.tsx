import { Html, Head, Preview, Tailwind, Body, Container, Section, Heading, Text, Hr } from '@react-email/components'

interface SendAuthCodeTemplateProps {
  email: string
  code: string
}

export function SendAuthCodeTemplate({ code, email }: SendAuthCodeTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmação de e-mail</Preview>
      <Tailwind>
        <Body className='bg-white my-auto mx-auto font-sans'>
          <Container className='border border-solid border-zinc-300 rounded my-[40px] mx-auto p-[20px] w-[465px]'>
            <Heading className="text-black font-bold text-[24px] text-center p-0 my-[30px] mx-0">
              Código de confirmação
            </Heading>
            <Text className="text-black text-[14px] leading-[24px] text-center">
              Você solicitou um código para autenticação para o mail.in através do e-mail{' '}
              {email}.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <span className='text-lg font-semibold no-underline text-center'>{code}</span>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              O código tem validade de 10 minutos.
            </Text>
            <Text className="text-[#666666] text-[10px] leading-[24px]">
              Se você não solicitou esse código, apenas descarte
              esse e-mail.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}